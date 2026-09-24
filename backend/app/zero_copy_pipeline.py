import cupy as cp
CUDA_DRAW_KERNEL = r'''
extern "C" __global__
void draw_bounding_boxes_kernel(
    unsigned char* frame,
    int width,
    int height,
    int stride,
    const float* boxes,
    int num_boxes
) {
    int x = blockDim.x * blockIdx.x + threadIdx.x;
    int y = blockDim.y * blockIdx.y + threadIdx.y;

    if (x >= width || y >= height) return;

    for (int b = 0; b < num_boxes; ++b) {
        int offset = b * 8;
        float x1 = boxes[offset + 0];
        float y1 = boxes[offset + 1];
        float x2 = boxes[offset + 2];
        float y2 = boxes[offset + 3];
        float r  = boxes[offset + 4];
        float g  = boxes[offset + 5];
        float b_val = boxes[offset + 6];
        float th = boxes[offset + 7];

        bool on_top    = (y >= y1 - th && y <= y1 + th) && (x >= x1 && x <= x2);
        bool on_bottom = (y >= y2 - th && y <= y2 + th) && (x >= x1 && x <= x2);
        bool on_left   = (x >= x1 - th && x <= x1 + th) && (y >= y1 && y <= y2);
        bool on_right  = (x >= x2 - th && x <= x2 + th) && (y >= y1 && y <= y2);

        if (on_top || on_bottom || on_left || on_right) {
            int pixel_idx = (y * stride) + (x * 3);
            frame[pixel_idx + 0] = (unsigned char)r;
            frame[pixel_idx + 1] = (unsigned char)g;
            frame[pixel_idx + 2] = (unsigned char)b_val;
            break;
        }
    }
}
'''


class ZeroCopyPipeline:
    def __init__(self, width: int = 3840, height: int = 2160, device_id: int = 0):
        self.width = width
        self.height = height
        self.device_id = device_id
        cp.cuda.Device(self.device_id).use()

        self.kernel = cp.RawKernel(CUDA_DRAW_KERNEL, 'draw_bounding_boxes_kernel')

    def preprocess_for_yolo(self, gpu_frame: cp.ndarray, target_size: int = 640) -> cp.ndarray:
        """
        Strided slicing resize and fp32 normalization directly on the GPU surface.
        Eliminates cv2.resize() on CPU.
        """
        step_y = self.height // target_size
        step_x = self.width // target_size
      
        resized = gpu_frame[::step_y, ::step_x, :][:target_size, :target_size, :]

        chw = resized.transpose(2, 0, 1).astype(cp.float32) / 255.0
        return cp.expand_dims(chw, axis=0)

    def draw_overlays_in_vram(self, gpu_frame: cp.ndarray, bounding_boxes: cp.ndarray):
        """
        Executes parallel GPU threads to stamp bounding boxes into the video frame buffer.
        """
        if len(bounding_boxes) == 0:
            return

        threads_per_block = (16, 16)
        blocks_per_grid = (
            (self.width + threads_per_block[0] - 1) // threads_per_block[0],
            (self.height + threads_per_block[1] - 1) // threads_per_block[1]
        )

        stride = self.width * 3
        self.kernel(
            blocks_per_grid,
            threads_per_block,
            (gpu_frame, self.width, self.height, stride, bounding_boxes, len(bounding_boxes))
        )
