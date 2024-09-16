import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import { DeliveryContractCreated } from "../generated/DeliveryFactory/DeliveryFactory"

export function createDeliveryContractCreatedEvent(
  contractAddress: Address
): DeliveryContractCreated {
  let deliveryContractCreatedEvent = changetype<DeliveryContractCreated>(
    newMockEvent()
  )

  deliveryContractCreatedEvent.parameters = new Array()

  deliveryContractCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "contractAddress",
      ethereum.Value.fromAddress(contractAddress)
    )
  )

  return deliveryContractCreatedEvent
}
