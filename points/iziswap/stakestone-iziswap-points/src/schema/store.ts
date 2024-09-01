
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type { String, Int, BigInt, Float, ID, Bytes, Timestamp, Boolean } from '@sentio/sdk/store'
import { Entity, Required, One, Many, Column, ListColumn, AbstractEntity } from '@sentio/sdk/store'
import { BigDecimal } from '@sentio/bigdecimal'
import { DatabaseSchema } from '@sentio/sdk'






@Entity("PositionSnapshot")
export class PositionSnapshot extends AbstractEntity  {

	@Required
	@Column("ID")
	id: ID

	@Required
	@Column("String")
	network: String

	@Required
	@Column("BigInt")
	timestampMilli: BigInt

	@Required
	@Column("String")
	poolAddress: String

	@Required
	@Column("String")
	owner: String

	@Required
	@Column("BigInt")
	stoneBalance: BigInt
  constructor(data: Partial<PositionSnapshot>) {super()}
}


const source = ` type PositionSnapshot @entity {
    id: ID!
    network: String!
    timestampMilli: BigInt!
    poolAddress: String!
    owner: String!
    stoneBalance: BigInt!
}
`
DatabaseSchema.register({
  source,
  entities: {
    "PositionSnapshot": PositionSnapshot
  }
})
