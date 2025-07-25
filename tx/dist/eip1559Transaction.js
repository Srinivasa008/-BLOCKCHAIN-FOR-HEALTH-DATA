"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_util_1 = require("ethereumjs-util");
const baseTransaction_1 = require("./baseTransaction");
const types_1 = require("./types");
const util_1 = require("./util");
const TRANSACTION_TYPE = 2;
const TRANSACTION_TYPE_BUFFER = Buffer.from(TRANSACTION_TYPE.toString(16).padStart(2, '0'), 'hex');
/**
 * Typed transaction with a new gas fee market mechanism
 *
 * - TransactionType: 2
 * - EIP: [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559)
 */
class FeeMarketEIP1559Transaction extends baseTransaction_1.BaseTransaction {
    /**
     * This constructor takes the values, validates them, assigns them and freezes the object.
     *
     * It is not recommended to use this constructor directly. Instead use
     * the static factory methods to assist in creating a Transaction object from
     * varying data types.
     */
    constructor(txData, opts = {}) {
        var _a, _b;
        super(Object.assign(Object.assign({}, txData), { type: TRANSACTION_TYPE }));
        /**
         * The default HF if the tx type is active on that HF
         * or the first greater HF where the tx is active.
         *
         * @hidden
         */
        this.DEFAULT_HARDFORK = 'london';
        const { chainId, accessList, maxFeePerGas, maxPriorityFeePerGas } = txData;
        this.common = this._getCommon(opts.common, chainId);
        this.chainId = this.common.chainIdBN();
        if (!this.common.isActivatedEIP(1559)) {
            throw new Error('EIP-1559 not enabled on Common');
        }
        this.activeCapabilities = this.activeCapabilities.concat([1559, 2718, 2930]);
        // Populate the access list fields
        const accessListData = util_1.AccessLists.getAccessListData(accessList !== null && accessList !== void 0 ? accessList : []);
        this.accessList = accessListData.accessList;
        this.AccessListJSON = accessListData.AccessListJSON;
        // Verify the access list format.
        util_1.AccessLists.verifyAccessList(this.accessList);
        this.maxFeePerGas = new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(maxFeePerGas === '' ? '0x' : maxFeePerGas));
        this.maxPriorityFeePerGas = new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(maxPriorityFeePerGas === '' ? '0x' : maxPriorityFeePerGas));
        this._validateCannotExceedMaxInteger({
            maxFeePerGas: this.maxFeePerGas,
            maxPriorityFeePerGas: this.maxPriorityFeePerGas,
        }, 256);
        if (this.maxFeePerGas.lt(this.maxPriorityFeePerGas)) {
            const msg = this._errorMsg('maxFeePerGas cannot be less than maxPriorityFeePerGas (The total must be the larger of the two)');
            throw new Error(msg);
        }
        if (this.v && !this.v.eqn(0) && !this.v.eqn(1)) {
            const msg = this._errorMsg('The y-parity of the transaction should either be 0 or 1');
            throw new Error(msg);
        }
        if (this.common.gteHardfork('homestead') && ((_a = this.s) === null || _a === void 0 ? void 0 : _a.gt(types_1.N_DIV_2))) {
            const msg = this._errorMsg('Invalid Signature: s-values greater than secp256k1n/2 are considered invalid');
            throw new Error(msg);
        }
        const freeze = (_b = opts === null || opts === void 0 ? void 0 : opts.freeze) !== null && _b !== void 0 ? _b : true;
        if (freeze) {
            Object.freeze(this);
        }
    }
    /**
     * EIP-2930 alias for `r`
     *
     * @deprecated use `r` instead
     */
    get senderR() {
        return this.r;
    }
    /**
     * EIP-2930 alias for `s`
     *
     * @deprecated use `s` instead
     */
    get senderS() {
        return this.s;
    }
    /**
     * EIP-2930 alias for `v`
     *
     * @deprecated use `v` instead
     */
    get yParity() {
        return this.v;
    }
    /**
     * Instantiate a transaction from a data dictionary.
     *
     * Format: { chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data,
     * accessList, v, r, s }
     *
     * Notes:
     * - `chainId` will be set automatically if not provided
     * - All parameters are optional and have some basic default values
     */
    static fromTxData(txData, opts = {}) {
        return new FeeMarketEIP1559Transaction(txData, opts);
    }
    /**
     * Instantiate a transaction from the serialized tx.
     *
     * Format: `0x02 || rlp([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data,
     * accessList, signatureYParity, signatureR, signatureS])`
     */
    static fromSerializedTx(serialized, opts = {}) {
        if (!serialized.slice(0, 1).equals(TRANSACTION_TYPE_BUFFER)) {
            throw new Error(`Invalid serialized tx input: not an EIP-1559 transaction (wrong tx type, expected: ${TRANSACTION_TYPE}, received: ${serialized
                .slice(0, 1)
                .toString('hex')}`);
        }
        const values = ethereumjs_util_1.rlp.decode(serialized.slice(1));
        if (!Array.isArray(values)) {
            throw new Error('Invalid serialized tx input: must be array');
        }
        return FeeMarketEIP1559Transaction.fromValuesArray(values, opts);
    }
    /**
     * Instantiate a transaction from the serialized tx.
     * (alias of {@link FeeMarketEIP1559Transaction.fromSerializedTx})
     *
     * Note: This means that the Buffer should start with 0x01.
     *
     * @deprecated this constructor alias is deprecated and will be removed
     * in favor of the {@link FeeMarketEIP1559Transaction.fromSerializedTx} constructor
     */
    static fromRlpSerializedTx(serialized, opts = {}) {
        return FeeMarketEIP1559Transaction.fromSerializedTx(serialized, opts);
    }
    /**
     * Create a transaction from a values array.
     *
     * Format: `[chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data,
     * accessList, signatureYParity, signatureR, signatureS]`
     */
    static fromValuesArray(values, opts = {}) {
        if (values.length !== 9 && values.length !== 12) {
            throw new Error('Invalid EIP-1559 transaction. Only expecting 9 values (for unsigned tx) or 12 values (for signed tx).');
        }
        const [chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data, accessList, v, r, s,] = values;
        return new FeeMarketEIP1559Transaction({
            chainId: new ethereumjs_util_1.BN(chainId),
            nonce,
            maxPriorityFeePerGas,
            maxFeePerGas,
            gasLimit,
            to,
            value,
            data,
            accessList: accessList !== null && accessList !== void 0 ? accessList : [],
            v: v !== undefined ? new ethereumjs_util_1.BN(v) : undefined,
            r,
            s,
        }, opts);
    }
    /**
     * The amount of gas paid for the data in this tx
     */
    getDataFee() {
        if (this.cache.dataFee && this.cache.dataFee.hardfork === this.common.hardfork()) {
            return this.cache.dataFee.value;
        }
        const cost = super.getDataFee();
        cost.iaddn(util_1.AccessLists.getDataFeeEIP2930(this.accessList, this.common));
        if (Object.isFrozen(this)) {
            this.cache.dataFee = {
                value: cost,
                hardfork: this.common.hardfork(),
            };
        }
        return cost;
    }
    /**
     * The up front amount that an account must have for this transaction to be valid
     * @param baseFee The base fee of the block (will be set to 0 if not provided)
     */
    getUpfrontCost(baseFee = new ethereumjs_util_1.BN(0)) {
        const inclusionFeePerGas = ethereumjs_util_1.BN.min(this.maxPriorityFeePerGas, this.maxFeePerGas.sub(baseFee));
        const gasPrice = inclusionFeePerGas.add(baseFee);
        return this.gasLimit.mul(gasPrice).add(this.value);
    }
    /**
     * Returns a Buffer Array of the raw Buffers of the EIP-1559 transaction, in order.
     *
     * Format: `[chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data,
     * accessList, signatureYParity, signatureR, signatureS]`
     *
     * Use {@link FeeMarketEIP1559Transaction.serialize} to add a transaction to a block
     * with {@link Block.fromValuesArray}.
     *
     * For an unsigned tx this method uses the empty Buffer values for the
     * signature parameters `v`, `r` and `s` for encoding. For an EIP-155 compliant
     * representation for external signing use {@link FeeMarketEIP1559Transaction.getMessageToSign}.
     */
    raw() {
        return [
            (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.chainId),
            (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.nonce),
            (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.maxPriorityFeePerGas),
            (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.maxFeePerGas),
            (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.gasLimit),
            this.to !== undefined ? this.to.buf : Buffer.from([]),
            (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.value),
            this.data,
            this.accessList,
            this.v !== undefined ? (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.v) : Buffer.from([]),
            this.r !== undefined ? (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.r) : Buffer.from([]),
            this.s !== undefined ? (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.s) : Buffer.from([]),
        ];
    }
    /**
     * Returns the serialized encoding of the EIP-1559 transaction.
     *
     * Format: `0x02 || rlp([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data,
     * accessList, signatureYParity, signatureR, signatureS])`
     *
     * Note that in contrast to the legacy tx serialization format this is not
     * valid RLP any more due to the raw tx type preceding and concatenated to
     * the RLP encoding of the values.
     */
    serialize() {
        const base = this.raw();
        return Buffer.concat([TRANSACTION_TYPE_BUFFER, ethereumjs_util_1.rlp.encode(base)]);
    }
    /**
     * Returns the serialized unsigned tx (hashed or raw), which can be used
     * to sign the transaction (e.g. for sending to a hardware wallet).
     *
     * Note: in contrast to the legacy tx the raw message format is already
     * serialized and doesn't need to be RLP encoded any more.
     *
     * ```javascript
     * const serializedMessage = tx.getMessageToSign(false) // use this for the HW wallet input
     * ```
     *
     * @param hashMessage - Return hashed message if set to true (default: true)
     */
    getMessageToSign(hashMessage = true) {
        const base = this.raw().slice(0, 9);
        const message = Buffer.concat([TRANSACTION_TYPE_BUFFER, ethereumjs_util_1.rlp.encode(base)]);
        if (hashMessage) {
            return (0, ethereumjs_util_1.keccak256)(message);
        }
        else {
            return message;
        }
    }
    /**
     * Computes a sha3-256 hash of the serialized tx.
     *
     * This method can only be used for signed txs (it throws otherwise).
     * Use {@link FeeMarketEIP1559Transaction.getMessageToSign} to get a tx hash for the purpose of signing.
     */
    hash() {
        if (!this.isSigned()) {
            const msg = this._errorMsg('Cannot call hash method if transaction is not signed');
            throw new Error(msg);
        }
        if (Object.isFrozen(this)) {
            if (!this.cache.hash) {
                this.cache.hash = (0, ethereumjs_util_1.keccak256)(this.serialize());
            }
            return this.cache.hash;
        }
        return (0, ethereumjs_util_1.keccak256)(this.serialize());
    }
    /**
     * Computes a sha3-256 hash which can be used to verify the signature
     */
    getMessageToVerifySignature() {
        return this.getMessageToSign();
    }
    /**
     * Returns the public key of the sender
     */
    getSenderPublicKey() {
        var _a;
        if (!this.isSigned()) {
            const msg = this._errorMsg('Cannot call this method if transaction is not signed');
            throw new Error(msg);
        }
        const msgHash = this.getMessageToVerifySignature();
        // EIP-2: All transaction signatures whose s-value is greater than secp256k1n/2 are considered invalid.
        // Reasoning: https://ethereum.stackexchange.com/a/55728
        if (this.common.gteHardfork('homestead') && ((_a = this.s) === null || _a === void 0 ? void 0 : _a.gt(types_1.N_DIV_2))) {
            const msg = this._errorMsg('Invalid Signature: s-values greater than secp256k1n/2 are considered invalid');
            throw new Error(msg);
        }
        const { v, r, s } = this;
        try {
            return (0, ethereumjs_util_1.ecrecover)(msgHash, v.addn(27), // Recover the 27 which was stripped from ecsign
            (0, ethereumjs_util_1.bnToUnpaddedBuffer)(r), (0, ethereumjs_util_1.bnToUnpaddedBuffer)(s));
        }
        catch (e) {
            const msg = this._errorMsg('Invalid Signature');
            throw new Error(msg);
        }
    }
    _processSignature(v, r, s) {
        const opts = {
            common: this.common,
        };
        return FeeMarketEIP1559Transaction.fromTxData({
            chainId: this.chainId,
            nonce: this.nonce,
            maxPriorityFeePerGas: this.maxPriorityFeePerGas,
            maxFeePerGas: this.maxFeePerGas,
            gasLimit: this.gasLimit,
            to: this.to,
            value: this.value,
            data: this.data,
            accessList: this.accessList,
            v: new ethereumjs_util_1.BN(v - 27),
            r: new ethereumjs_util_1.BN(r),
            s: new ethereumjs_util_1.BN(s),
        }, opts);
    }
    /**
     * Returns an object with the JSON representation of the transaction
     */
    toJSON() {
        const accessListJSON = util_1.AccessLists.getAccessListJSON(this.accessList);
        return {
            chainId: (0, ethereumjs_util_1.bnToHex)(this.chainId),
            nonce: (0, ethereumjs_util_1.bnToHex)(this.nonce),
            maxPriorityFeePerGas: (0, ethereumjs_util_1.bnToHex)(this.maxPriorityFeePerGas),
            maxFeePerGas: (0, ethereumjs_util_1.bnToHex)(this.maxFeePerGas),
            gasLimit: (0, ethereumjs_util_1.bnToHex)(this.gasLimit),
            to: this.to !== undefined ? this.to.toString() : undefined,
            value: (0, ethereumjs_util_1.bnToHex)(this.value),
            data: '0x' + this.data.toString('hex'),
            accessList: accessListJSON,
            v: this.v !== undefined ? (0, ethereumjs_util_1.bnToHex)(this.v) : undefined,
            r: this.r !== undefined ? (0, ethereumjs_util_1.bnToHex)(this.r) : undefined,
            s: this.s !== undefined ? (0, ethereumjs_util_1.bnToHex)(this.s) : undefined,
        };
    }
    /**
     * Return a compact error string representation of the object
     */
    errorStr() {
        let errorStr = this._getSharedErrorPostfix();
        errorStr += ` maxFeePerGas=${this.maxFeePerGas} maxPriorityFeePerGas=${this.maxPriorityFeePerGas}`;
        return errorStr;
    }
    /**
     * Internal helper function to create an annotated error message
     *
     * @param msg Base error message
     * @hidden
     */
    _errorMsg(msg) {
        return `${msg} (${this.errorStr()})`;
    }
}
exports.default = FeeMarketEIP1559Transaction;
//# sourceMappingURL=eip1559Transaction.js.map