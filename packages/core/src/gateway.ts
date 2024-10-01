import mongoose from 'mongoose'

import { BaseErrors } from './errors'
import { generateUserChallenge, getUser, verifyUserWalletSignature } from './services/auth'
import { fetchFunctionManifest, storeFunctionManifest } from './services/functionManifests'
import {
	createFunction,
	deleteFunction,
	deployFunction,
	getFunction,
	listFunctions,
	updateFunction,
	updateFunctionEnvVars,
	updateFunctionSecrets
} from './services/functions'
import { lookupAndInvokeFunction } from './services/invoke'
import {
	endPublicNodeSession,
	getPublicNode,
	getPublicNodeNonce,
	getUserNode,
	linkUserNode,
	listUserNodes,
	registerPublicNode,
	startPublicNodeSession
} from './services/node'

interface GatewayOptions {
	mongoUri: string
	headNodeUri: string
	encryptionKey?: string
}

export class Gateway {
	_mongoUri: string
	_headNodeUri: string
	_encryptionKey?: string | undefined

	auth: {
		getUser: OmitThisParameter<typeof getUser>
		getChallenge: OmitThisParameter<typeof generateUserChallenge>
		verifySignature: OmitThisParameter<typeof verifyUserWalletSignature>
	}

	functions: {
		list: OmitThisParameter<typeof listFunctions>
		create: OmitThisParameter<typeof createFunction>
		get: OmitThisParameter<typeof getFunction>
		update: OmitThisParameter<typeof updateFunction>
		updateEnvVars: OmitThisParameter<typeof updateFunctionEnvVars>
		updateSecrets: OmitThisParameter<typeof updateFunctionSecrets>
		delete: OmitThisParameter<typeof deleteFunction>
		deploy: OmitThisParameter<typeof deployFunction>
		invoke: OmitThisParameter<typeof lookupAndInvokeFunction>
	}

	functionManifests: {
		fetch: OmitThisParameter<typeof fetchFunctionManifest>
		store: OmitThisParameter<typeof storeFunctionManifest>
	}

	nodes: {
		list: OmitThisParameter<typeof listUserNodes>
		get: OmitThisParameter<typeof getUserNode>
		link: OmitThisParameter<typeof linkUserNode>
	}

	publicNodes: {
		register: OmitThisParameter<typeof registerPublicNode>
		get: OmitThisParameter<typeof getPublicNode>
		startSession: OmitThisParameter<typeof startPublicNodeSession>
		endSession: OmitThisParameter<typeof endPublicNodeSession>
		getNonce: OmitThisParameter<typeof getPublicNodeNonce>
	}

	constructor(options: GatewayOptions) {
		this._mongoUri = options.mongoUri
		this._headNodeUri = options.headNodeUri

		if (options.encryptionKey) {
			this._encryptionKey = options.encryptionKey
		}

		if (options.mongoUri) {
			this.setConnection(options.mongoUri)
		}

		this.functions = {
			list: listFunctions.bind(this),
			create: createFunction.bind(this),
			get: getFunction.bind(this),
			update: updateFunction.bind(this),
			updateEnvVars: updateFunctionEnvVars.bind(this),
			updateSecrets: updateFunctionSecrets.bind(this),
			delete: deleteFunction.bind(this),
			deploy: deployFunction.bind(this),
			invoke: lookupAndInvokeFunction.bind(this)
		}

		this.functionManifests = {
			fetch: fetchFunctionManifest.bind(this),
			store: storeFunctionManifest.bind(this)
		}

		this.auth = {
			getUser: getUser.bind(this),
			getChallenge: generateUserChallenge.bind(this),
			verifySignature: verifyUserWalletSignature.bind(this)
		}

		this.nodes = {
			list: listUserNodes.bind(this),
			get: getUserNode.bind(this),
			link: linkUserNode.bind(this)
		}

		this.publicNodes = {
			register: registerPublicNode.bind(this),
			get: getPublicNode.bind(this),
			startSession: startPublicNodeSession.bind(this),
			endSession: endPublicNodeSession.bind(this),
			getNonce: getPublicNodeNonce.bind(this)
		}
	}

	async setConnection(mongoUri: string) {
		try {
			await mongoose.connect(mongoUri)
			this._mongoUri = mongoUri
		} catch (error) {
			throw new BaseErrors.ERR_INVALID_DB_CONNECTION()
		}
	}
}
