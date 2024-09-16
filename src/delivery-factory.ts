import { DeliveryContractCreated as DeliveryContractCreatedEvent } from "../generated/DeliveryFactory/DeliveryFactory"
import { DeliveryContractCreated } from "../generated/schema"

export function handleDeliveryContractCreated(
  event: DeliveryContractCreatedEvent
): void {
  let entity = new DeliveryContractCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.contractAddress = event.params.contractAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
