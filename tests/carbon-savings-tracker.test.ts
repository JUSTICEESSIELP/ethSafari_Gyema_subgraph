import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { CarbonSavingsLogged } from "../generated/schema"
import { CarbonSavingsLogged as CarbonSavingsLoggedEvent } from "../generated/CarbonSavingsTracker/CarbonSavingsTracker"
import { handleCarbonSavingsLogged } from "../src/carbon-savings-tracker"
import { createCarbonSavingsLoggedEvent } from "./carbon-savings-tracker-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let deliveryId = BigInt.fromI32(234)
    let carbonSavings = BigInt.fromI32(234)
    let newCarbonSavingsLoggedEvent = createCarbonSavingsLoggedEvent(
      deliveryId,
      carbonSavings
    )
    handleCarbonSavingsLogged(newCarbonSavingsLoggedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("CarbonSavingsLogged created and stored", () => {
    assert.entityCount("CarbonSavingsLogged", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CarbonSavingsLogged",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "deliveryId",
      "234"
    )
    assert.fieldEquals(
      "CarbonSavingsLogged",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "carbonSavings",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
