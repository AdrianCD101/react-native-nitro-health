package com.nitrohealth

import com.margelo.nitro.nitrohealth.HybridNitroHealthSpec

class HybridNitroHealth: HybridNitroHealthSpec() {    
    override fun sum(num1: Double, num2: Double): Double {
        return num1 + num2
    }
}
