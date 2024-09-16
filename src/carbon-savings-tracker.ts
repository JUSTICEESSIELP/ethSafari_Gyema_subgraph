import {
  CarbonSavingsLogged as CarbonSavingsLoggedEvent,
  UserCarbonSavingsUpdated as UserCarbonSavingsUpdatedEvent,
} from "../generated/CarbonSavingsTracker/CarbonSavingsTracker"
import {
  CarbonSavingsLogged,
  UserCarbonSavingsUpdated,
} from "../generated/schema"

export function handleCarbonSavingsLogged(
  event: CarbonSavingsLoggedEvent,
): void {
  let entity = new CarbonSavingsLogged(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.deliveryId = event.params.deliveryId
  entity.carbonSavings = event.params.carbonSavings

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
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
}
