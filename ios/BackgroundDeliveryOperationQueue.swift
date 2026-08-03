actor BackgroundDeliveryOperationQueue {
    private var tail: Task<Void, Never>?

    func run(_ operation: @escaping () async throws -> Void) async throws {
        let previous = tail
        let task = Task<Void, Error> {
            await previous?.value
            try await operation()
        }

        tail = Task<Void, Never> {
            _ = try? await task.value
        }

        try await task.value
    }
}
