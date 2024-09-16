import { BigInt, Bytes } from "@graphprotocol/graph-ts"

import {
  DeliveryCompleted as DeliveryCompletedEvent,
  DeliveryCreated as DeliveryCreatedEvent,
  EmissionsCalculated as EmissionsCalculatedEvent,
  LegAssigned as LegAssignedEvent,
  LegFulfilled as LegFulfilledEvent,
  NextDriverNotified as NextDriverNotifiedEvent,
} from "../generated/DeliveryContractReactive/DeliveryContractReactive"
import {
  DeliveryCompleted,
  EmissionsCalculated,
  LegAssigned,
  LegFulfilled,
  NextDriverNotified,
  Account,
  Delivery,
  DeliveryLeg,
} from "../generated/schema"
import { DeliveryContractReactive } from "../generated/templates/DeliveryContractReactive/DeliveryContractReactive"

export function handleDeliveryCompleted(event: DeliveryCompletedEvent):void {
  let deliveryIdBytes = Bytes.fromByteArray(Bytes.fromBigInt(event.params.deliveryId))
  let delivery = Delivery.load(deliveryIdBytes)
  if (delivery == null) {
    return
  }
  delivery.fulfilled = true
  delivery.updatedAt = event.block.timestamp
  delivery.status = "COMPLETED"
  delivery.save()

  let entity = new DeliveryCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.deliveryId = event.params.deliveryId
  

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}


export function handleDeliveryCreated(event: DeliveryCreatedEvent): void {
  let delivery = new Delivery(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  let customer = Account.load(event.params.customer.toHexString());
  if(customer == null){
    customer = new Account(event.params.customer.toHexString());
    customer.isDriver=false
    customer.totalCarbonSavings= new BigInt(0)
    customer.userAddress = event.params.customer

  }
  let Contract = DeliveryContractReactive.bind(event.address);
  let deliveryCount = Contract.deliveryCounter();
  let deliveryStruct = Contract.deliveries(deliveryCount);

  delivery.customer = event.params.customer.toHexString()
  delivery.pickupLocation= deliveryStruct.getPickupLocation()  // These would be set in the contract, we're simplifying here
  delivery.dropoffLocation = deliveryStruct.getDropoffLocation()
  delivery.packageWeight = BigInt.fromI32(0)
  delivery.deadline = event.block.timestamp.plus(BigInt.fromI32(86400))  // 24 hours from now
  delivery.fulfilled = false
  delivery.status = "CREATED"
  delivery.totalDistance = BigInt.fromI32(0)
  delivery.totalCarbonSavings = BigInt.fromI32(0)
  delivery.createdAt = event.block.timestamp
  delivery.updatedAt = event.block.timestamp
  delivery.deliveryId = event.params.deliveryId
  delivery.blockNumber = event.block.number
  delivery.blockTimestamp = event.block.timestamp
  delivery.transactionHash = event.transaction.hash

  delivery.save()
}

export function handleEmissionsCalculated(
  event: EmissionsCalculatedEvent,
): void {
  let entity = new EmissionsCalculated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.deliveryId = event.params.deliveryId
  entity.legId = event.params.legId
  entity.carbonSavings = event.params.carbonSavings

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleLegAssigned(event: LegAssignedEvent): void {
  let deliveryIdBytes = Bytes.fromByteArray(Bytes.fromBigInt(event.params.deliveryId))
  let delivery = Delivery.load(deliveryIdBytes)
 
  if (delivery == null) {
    return
  }
  if(delivery.fulfilled == true){
    return 
  }
  delivery.status = "IN_PROGRESS"
  let deliveryLegId = event.params.deliveryId.toHexString() + "-" + event.params.legId.toString()
  let deliveryLeg = new DeliveryLeg(deliveryLegId)
  let driver = Account.load(event.params.driver.toHexString())
  if (driver == null) {
    driver = new Account(event.params.driver.toHexString())
    driver.totalCarbonSavings = BigInt.fromI32(0)
    driver.isDriver = true
    driver.userAddress = event.params.driver
  }
  // let Contract = DeliveryContractReactive.bind(event.address);
  // let deliveryCount = Contract.deliveryCounter();
  // let deliveryStruct = Contract.deliveries(deliveryCount);
  //   if(deliveryStruct.)
  deliveryLeg.delivery = delivery.id
  deliveryLeg.legId = event.params.legId.toI32()
  deliveryLeg.driver = driver.id
  deliveryLeg.startLocation = ""  // These would be set in the contract
  deliveryLeg.endLocation = ""
  deliveryLeg.distance = BigInt.fromI32(0)
  deliveryLeg.fulfilled = false
  deliveryLeg.estimatedStartTime = event.block.timestamp
  deliveryLeg.estimatedEndTime = event.block.timestamp.plus(BigInt.fromI32(3600))  // 1 hour from now
  deliveryLeg.carbonSavings = BigInt.fromI32(0)
  deliveryLeg.save()
  let entity = new LegAssigned(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.deliveryId = event.params.deliveryId
  entity.legId = event.params.legId
  entity.driver = event.params.driver

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleLegFulfilled(event: LegFulfilledEvent): void {
  let deliveryLegId = event.params.deliveryId.toHexString() + "-" + event.params.legId.toString()
  let deliveryLeg = DeliveryLeg.load(deliveryLegId)
  if (deliveryLeg == null) {
    return
  }
  deliveryLeg.fulfilled = true
  deliveryLeg.actualEndTime = event.block.timestamp
  deliveryLeg.save()
  let deliveryIdBytes = Bytes.fromByteArray(Bytes.fromBigInt(event.params.deliveryId))
  let delivery = Delivery.load(deliveryIdBytes)

  if (delivery) {
    delivery.updatedAt = event.block.timestamp
    delivery.save()
  }
  let entity = new LegFulfilled(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.deliveryId = event.params.deliveryId
  entity.legId = event.params.legId
  entity.driver = event.params.driver

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNextDriverNotified(event: NextDriverNotifiedEvent): void {
  let entity = new NextDriverNotified(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.deliveryId = event.params.deliveryId
  entity.legId = event.params.legId
  entity.nextDriver = event.params.nextDriver

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}