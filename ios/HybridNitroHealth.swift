//
//  HybridNitroHealth.swift
//  Pods
//
//  Created by Adrian White on 4/27/2026.
//

import Foundation
import HealthKit

class HybridNitroHealth: HybridNitroHealthSpec {
    func isAvailable() throws -> Bool {
        return HKHealthStore.isHealthDataAvailable()
    }
}
