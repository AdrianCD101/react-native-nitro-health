import Foundation
import HealthKit

func makeSleepCategorySamples(
    sessions: [NativeSleepSessionInput],
    categoryType: HKCategoryType
) throws -> [HKCategorySample] {
    return try sessions.enumerated().flatMap { sessionIndex, session in
        let startDate = Date(timeIntervalSince1970: session.startTimeMs / 1000)
        let endDate = Date(timeIntervalSince1970: session.endTimeMs / 1000)
        guard startDate < endDate else {
            throw sleepSessionInputError("sessions[\(sessionIndex)]: startDate must be before endDate")
        }

        let timeZone = try resolveIanaTimeZone(
            session.timeZone,
            errorPrefix: "sessions[\(sessionIndex)]"
        )
        let metadata: [String: Any] = [HKMetadataKeyTimeZone: timeZone.identifier]
        let indexedStages = session.stages.enumerated().map { stageIndex, stage in
            (
                stageIndex: stageIndex,
                stage: stage,
                startDate: Date(timeIntervalSince1970: stage.startTimeMs / 1000),
                endDate: Date(timeIntervalSince1970: stage.endTimeMs / 1000)
            )
        }.sorted { left, right in
            if left.startDate != right.startDate {
                return left.startDate < right.startDate
            }
            if left.endDate != right.endDate {
                return left.endDate < right.endDate
            }
            return left.stageIndex < right.stageIndex
        }

        var previousStage: (stageIndex: Int, endDate: Date)?
        var samples = [
            HKCategorySample(
                type: categoryType,
                value: HKCategoryValueSleepAnalysis.inBed.rawValue,
                start: startDate,
                end: endDate,
                metadata: metadata
            )
        ]

        for indexedStage in indexedStages {
            let stagePrefix = "sessions[\(sessionIndex)].stages[\(indexedStage.stageIndex)]: "
            guard indexedStage.startDate < indexedStage.endDate else {
                throw sleepSessionInputError("\(stagePrefix)startDate must be before endDate")
            }
            guard indexedStage.startDate >= startDate, indexedStage.endDate <= endDate else {
                throw sleepSessionInputError("\(stagePrefix)interval must be contained within its sleep session")
            }
            if let previousStage, indexedStage.startDate < previousStage.endDate {
                throw sleepSessionInputError(
                    "\(stagePrefix)interval overlaps sessions[\(sessionIndex)].stages[\(previousStage.stageIndex)]"
                )
            }

            samples.append(
                HKCategorySample(
                    type: categoryType,
                    value: try healthKitSleepStageValue(indexedStage.stage.stage),
                    start: indexedStage.startDate,
                    end: indexedStage.endDate,
                    metadata: metadata
                )
            )
            previousStage = (stageIndex: indexedStage.stageIndex, endDate: indexedStage.endDate)
        }

        return samples
    }
}

private func sleepSessionInputError(_ message: String) -> NSError {
    return NSError(domain: "NitroHealth", code: 2, userInfo: [NSLocalizedDescriptionKey: message])
}
