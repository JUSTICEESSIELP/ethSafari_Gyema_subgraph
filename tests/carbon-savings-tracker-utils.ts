import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  CarbonSavingsLogged,
  UserCarbonSavingsUpdated
} from "../generated/CarbonSavingsTracker/CarbonSavingsTracker"

export function createCarbonSavingsLoggedEvent(
  deliveryId: BigInt,
  carbonSavings: BigInt
): CarbonSavingsLogged {
  let carbonSavingsLoggedEvent = changetype<CarbonSavingsLogged>(newMockEvent())

  carbonSavingsLoggedEvent.parameters = new Array()

  carbonSavingsLoggedEvent.parameters.push(
    new ethereum.EventParam(
      "deliveryId",
      ethereum.Value.fromUnsignedBigInt(deliveryId)
    )
  )
  carbonSavingsLoggedEvent.parameters.push(
    new ethereum.EventParam(
      "carbonSavings",
      ethereum.Value.fromUnsignedBigInt(carbonSavings)
    )
  )

  return carbonSavingsLoggedEvent
}

export function createUserCarbonSavingsUpdatedEvent(
  user: Address,
  totalCarbonSavings: BigInt
): UserCarbonSavingsUpdated {
  let userCarbonSavingsUpdatedEvent = changetype<UserCarbonSavingsUpdated>(
    newMockEvent()
  )

  userCarbonSavingsUpdatedEvent.parameters = new Array()

  userCarbonSavingsUpdatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  userCarbonSavingsUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "totalCarbonSavings",
      ethereum.Value.fromUnsignedBigInt(totalCarbonSavings)
    )
  )

  return userCarbonSavingsUpdatedEvent
}
