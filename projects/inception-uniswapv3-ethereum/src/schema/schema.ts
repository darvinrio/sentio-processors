/* Autogenerated file. Do not edit manually. */

/* tslint:disable */
/* eslint-disable */
import { entity, derivedFrom, Timestamp, Int, Float, String, Bytes, Boolean, ID, Entity, Store } from '@sentio/sdk/store'
import { BigDecimalConverter, BigIntConverter, IntConverter, StringConverter, IDConverter, BooleanConverter, BytesConverter, TimestampConverter, FloatConverter, StructConverter, required_, array_, enumerate_, objectId_ } from '@sentio/sdk/store'
import { DatabaseSchema, BigDecimal } from "@sentio/sdk"
type BigInt = bigint

type PositionSnapshotData = PositionSnapshot

@entity("PositionSnapshot")
export class PositionSnapshot extends Entity {
  static entityConverter = new StructConverter({
 		id: required_(StringConverter),
		owner: required_(StringConverter),
		tickLower: required_(BigIntConverter),
		tickUpper: required_(BigIntConverter),
		timestampMilli: required_(BigIntConverter),
		inceptionETHBalance: required_(BigDecimalConverter),
		wETHBalance: required_(BigDecimalConverter),
		poolAddress: required_(StringConverter), 
})
  constructor(data: Partial<PositionSnapshotData>) {
    super(PositionSnapshot.entityConverter.from(data))
  }
	get id(): String { return this.get("id", required_(StringConverter)) }
  set id(value: String) { this.set("id", value, required_(StringConverter)) }
	get owner(): String { return this.get("owner", required_(StringConverter)) }
  set owner(value: String) { this.set("owner", value, required_(StringConverter)) }
	get tickLower(): BigInt { return this.get("tickLower", required_(BigIntConverter)) }
  set tickLower(value: BigInt) { this.set("tickLower", value, required_(BigIntConverter)) }
	get tickUpper(): BigInt { return this.get("tickUpper", required_(BigIntConverter)) }
  set tickUpper(value: BigInt) { this.set("tickUpper", value, required_(BigIntConverter)) }
	get timestampMilli(): BigInt { return this.get("timestampMilli", required_(BigIntConverter)) }
  set timestampMilli(value: BigInt) { this.set("timestampMilli", value, required_(BigIntConverter)) }
	get inceptionETHBalance(): BigDecimal { return this.get("inceptionETHBalance", required_(BigDecimalConverter)) }
  set inceptionETHBalance(value: BigDecimal) { this.set("inceptionETHBalance", value, required_(BigDecimalConverter)) }
	get wETHBalance(): BigDecimal { return this.get("wETHBalance", required_(BigDecimalConverter)) }
  set wETHBalance(value: BigDecimal) { this.set("wETHBalance", value, required_(BigDecimalConverter)) }
	get poolAddress(): String { return this.get("poolAddress", required_(StringConverter)) }
  set poolAddress(value: String) { this.set("poolAddress", value, required_(StringConverter)) }
}

const source = `type PositionSnapshot @entity {
  id: String!
  owner: String!
  tickLower: BigInt!
  tickUpper: BigInt!
  timestampMilli: BigInt!
  inceptionETHBalance: BigDecimal!
  wETHBalance: BigDecimal!
  poolAddress: String!
}`
DatabaseSchema.register({
  source,
  entities: {
    "PositionSnapshot": PositionSnapshot
  }
})
