import mongoose from 'mongoose'

import { IDocument } from '../interfaces/generic'

export interface INodeModel extends IDocument {
	pubKey: string
	userId?: string
}

const NodeSchema = new mongoose.Schema(
	{
		pubKey: { type: String, required: true },
		userId: { type: String, required: false }
	},
	{
		timestamps: true
	}
)

const Nodes = mongoose.model<INodeModel>('Node', NodeSchema)

export default Nodes