struct BoundingBox {
    int x1;
    int y1;
    int x2;
    int y2;
    unsigned char r;
    unsigned char g;
    unsigned char b;
    int thickness;
    int corner_len;
};

__global__ void render_bounding_boxes_kernel(
    unsigned char* __restrict__ d_frame,
    int width,
    int height,
    int channels, // 3 for RGB, 4 for RGBA
    const BoundingBox* __restrict__ d_boxes,
    int num_boxes
) {
    int box_idx = blockIdx.z;
    if (box_idx >= num_boxes) return;

    const BoundingBox box = d_boxes[box_idx];

    // Compute pixel coordinates within thread block
    int x = box.x1 + blockIdx.x * blockDim.x + threadIdx.x;
    int y = box.y1 + blockIdx.y * blockDim.y + threadIdx.y;

    if (x < 0 || x >= width || y < 0 || y >= height) return;
    if (x > box.x2 || y > box.y2) return;

    // Check if current pixel lies within border thickness or corner bracket
    const bool on_top = (y <= box.y1 + box.thickness);
    const bool on_bottom = (y >= box.y2 - box.thickness);
    const bool on_left = (x <= box.x1 + box.thickness);
    const bool on_right = (x >= box.x2 - box.thickness);

    bool near_x_corner = false;
    bool near_y_corner = false;
    bool is_corner = false;

    if (box.corner_len > 0) {
        near_x_corner = (x <= box.x1 + box.corner_len) || (x >= box.x2 - box.corner_len);
        near_y_corner = (y <= box.y1 + box.corner_len) || (y >= box.y2 - box.corner_len);
        is_corner = ((on_top || on_bottom) && near_x_corner) || ((on_left || on_right) && near_y_corner);
    }

    if (on_top || on_bottom || on_left || on_right || is_corner) {
        int pixel_idx = (y * width + x) * channels;
        d_frame[pixel_idx + 0] = box.r;
        d_frame[pixel_idx + 1] = box.g;
        d_frame[pixel_idx + 2] = box.b;
    }
}

/**
 * Kernel for alpha-blended transparent header tags (e.g. "Sedan 98% [54 km/h]")
 */
__global__ void render_tag_overlay_kernel(
    unsigned char* __restrict__ d_frame,
    int width,
    int height,
    int channels,
    int tag_x1,
    int tag_y1,
    int tag_x2,
    int tag_y2,
    unsigned char r,
    unsigned char g,
    unsigned char b,
    float alpha
) {
    int x = tag_x1 + blockIdx.x * blockDim.x + threadIdx.x;
    int y = tag_y1 + blockIdx.y * blockDim.y + threadIdx.y;

    if (x < 0 || x >= width || y < 0 || y >= height) return;
    if (x > tag_x2 || y > tag_y2) return;

    int pixel_idx = (y * width + x) * channels;
    float inv_alpha = 1.0f - alpha;

    d_frame[pixel_idx + 0] = (unsigned char)(d_frame[pixel_idx + 0] * inv_alpha + r * alpha);
    d_frame[pixel_idx + 1] = (unsigned char)(d_frame[pixel_idx + 1] * inv_alpha + g * alpha);
    d_frame[pixel_idx + 2] = (unsigned char)(d_frame[pixel_idx + 2] * inv_alpha + b * alpha);
}
