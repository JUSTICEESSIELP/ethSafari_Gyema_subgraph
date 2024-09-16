
import { BigInt } from "@graphprotocol/graph-ts"
import {
  DeliveryCreated,
  LegAssigned,
  LegFulfilled,
  EmissionsCalculated,
  DeliveryCompleted
} from "../generated/DeliveryContractReactive/DeliveryContractReactive"
import { Delivery, DeliveryLeg, Account, DailyCarbonSavings, SearchIndex } from "../generated/schema"
import { DeliveryLeg as DeliveryLegTemplate } from "../generated/templates"

export function handleDeliveryCreated(event: DeliveryCreated): void {
  let delivery = new Delivery(event.params.deliveryId.toHexString())
  let customer = Account.load(event.params.customer.toHexString())
  if (customer == null) {
    customer = new Account(event.params.customer.toHexString())
    customer.totalCarbonSavings = BigInt.fromI32(0)
    customer.isDriver = false
  }
  delivery.customer = customer.id
  delivery.pickupLocation = ""  // These would be set in the contract, we're simplifying here
  delivery.dropoffLocation = ""
  delivery.packageWeight = BigInt.fromI32(0)
  delivery.deadline = event.block.timestamp.plus(BigInt.fromI32(86400))  // 24 hours from now
  delivery.fulfilled = false
  delivery.totalDistance = BigInt.fromI32(0)
  delivery.totalCarbonSavings = BigInt.fromI32(0)
  delivery.createdAt = event.block.timestamp
  delivery.updatedAt = event.block.timestamp
  delivery.save()

  customer.save()

  let searchIndex = new SearchIndex(event.params.deliveryId.toHexString())
  searchIndex.content = `Delivery ${event.params.deliveryId.toString()} for customer ${customer.name}`
  searchIndex.save()
}

export function handleLegAssigned(event: LegAssigned): void {
  let deliveryLegId = event.params.deliveryId.toHexString() + "-" + event.params.legId.toString()
  let deliveryLeg = new DeliveryLeg(deliveryLegId)
  let delivery = Delivery.load(event.params.deliveryId.toHexString())
  if (delivery == null) {
    return
  }
  let driver = Account.load(event.params.driver.toHexString())
  if (driver == null) {
    driver = new Account(event.params.driver.toHexString())
    driver.totalCarbonSavings = BigInt.fromI32(0)
    driver.isDriver = true
  }
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

  driver.save()

  DeliveryLegTemplate.create(event.params.deliveryId)
}

export function handleLegFulfilled(event: LegFulfilled): void {
  let deliveryLegId = event.params.deliveryId.toHexString() + "-" + event.params.legId.toString()
  let deliveryLeg = DeliveryLeg.load(deliveryLegId)
  if (deliveryLeg == null) {
    return
  }
  deliveryLeg.fulfilled = true
  deliveryLeg.actualEndTime = event.block.timestamp
  deliveryLeg.save()

  let delivery = Delivery.load(event.params.deliveryId.toHexString())
  if (delivery) {
    delivery.updatedAt = event.block.timestamp
    delivery.save()
  }
}

export function handleEmissionsCalculated(event: EmissionsCalculated): void {
  let deliveryLegId = event.params.deliveryId.toHexString() + "-" + event.params.legId.toString()
  let deliveryLeg = DeliveryLeg.load(deliveryLegId)
  if (deliveryLeg == null) {
    return
  }
  deliveryLeg.carbonSavings = event.params.carbonSavings
  deliveryLeg.save()

  let delivery = Delivery.load(event.params.deliveryId.toHexString())
  if (delivery) {
    delivery.totalCarbonSavings = delivery.totalCarbonSavings.plus(event.params.carbonSavings)
    delivery.save()
  }

  let driver = Account.load(deliveryLeg.driver)
  if (driver) {
    driver.totalCarbonSavings = driver.totalCarbonSavings.plus(event.params.carbonSavings)
    driver.save()
  }

  let dateString = event.block.timestamp.toString().slice(0, 10)  // YYYY-MM-DD
  let dailySavings = DailyCarbonSavings.load(dateString)
  if (dailySavings == null) {
    dailySavings = new DailyCarbonSavings(dateString)
    dailySavings.date = dateString
    dailySavings.totalSavings = BigInt.fromI32(0)
  }
  dailySavings.totalSavings = dailySavings.totalSavings.plus(event.params.carbonSavings)
  dailySavings.save()
}

export function handleDeliveryCompleted(event: DeliveryCompleted): void {
  let delivery = Delivery.load(event.params.deliveryId.toHexString())
  if (delivery == null) {
    return
  }
  delivery.fulfilled = true
  delivery.updatedAt = event.block.timestamp
  delivery.save()
}
