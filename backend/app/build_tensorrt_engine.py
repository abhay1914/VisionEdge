import tensorrt as trt


ONNX_PATH = "yolo11n.onnx"
ENGINE_PATH = "yolo11n.engine"

logger = trt.Logger(trt.Logger.INFO)


def main():
    print("TensorRT:", trt.__version__)
    print("Loading ONNX model...")

    builder = trt.Builder(logger)

    network = builder.create_network()

    parser = trt.OnnxParser(network, logger)

    with open(ONNX_PATH, "rb") as model_file:
        onnx_data = model_file.read()

    if not parser.parse(onnx_data):
        print("ERROR: Failed to parse ONNX model.")

        for index in range(parser.num_errors):
            print(parser.get_error(index))

        return

    print("ONNX parsing: SUCCESS")

    config = builder.create_builder_config()

    config.set_memory_pool_limit(
        trt.MemoryPoolType.WORKSPACE,
        2 * 1024 * 1024 * 1024,
    )

    print("TensorRT optimization: ENABLED")

    print("Building TensorRT engine...")
    print("This may take a few minutes...")

    serialized_engine = builder.build_serialized_network(
        network,
        config,
    )

    if serialized_engine is None:
        print("ERROR: TensorRT engine build failed.")
        return

    with open(ENGINE_PATH, "wb") as engine_file:
        engine_file.write(serialized_engine)

    print()
    print("======================================")
    print("TensorRT engine build: SUCCESS")
    print(f"Engine: {ENGINE_PATH}")
    print("======================================")


if __name__ == "__main__":
    main()