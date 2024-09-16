import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  CarbonSavingsLogged as CarbonSavingsLoggedEvent,
  UserCarbonSavingsUpdated as UserCarbonSavingsUpdatedEvent,
} from "../generated/CarbonSavingsTracker/CarbonSavingsTracker"
import {
  CarbonSavingsData,
  CarbonSavingsLogged,
  Delivery,
  UserCarbonSavingsUpdated,
} from "../generated/schema"

export function handleCarbonSavingsLogged(
  event: CarbonSavingsLoggedEvent,
): void {
  let deliveryIdBytes = Bytes.fromByteArray(Bytes.fromBigInt(event.params.deliveryId))
  let delivery = Delivery.load(deliveryIdBytes)
  if (delivery == null) {
   return
  }
  delivery.contractAddress = event.address
  delivery.totalCarbonSavings = BigInt.fromI32(0)
  delivery.status = "CREATED"
  delivery.createdAt = event.block.timestamp
  delivery.totalCarbonSavings = delivery.totalCarbonSavings.plus(event.params.carbonSavings)
  delivery.save()

  let entity = new CarbonSavingsLogged(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.deliveryId = event.params.deliveryId
  entity.carbonSavings = event.params.carbonSavings

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()


  // Create CarbonSavingsData entity for aggregation
  let carbonSavingsData = new CarbonSavingsData(event.transaction.hash.toHexString())
  carbonSavingsData.user = delivery.customer
  carbonSavingsData.carbonSavings = event.params.carbonSavings
  carbonSavingsData.save()
}

export function handleUserCarbonSavingsUpdated(
  event: UserCarbonSavingsUpdatedEvent,
): void {
  let entity = new UserCarbonSavingsUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.user = event.params.user
  entity.totalCarbonSavings = event.params.totalCarbonSavings

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
  // let carbonSavingsData = new CarbonSavingsData(event.transaction.hash.toHexString())
  // carbonSavingsData.user = entity.id.toHexString()
  // carbonSavingsData.carbonSavings = event.params.totalCarbonSavings.minus(entity.totalCarbonSavings)
  // carbonSavingsData.save()
}
