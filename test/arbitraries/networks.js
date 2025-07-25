"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Batches = exports.Batch = exports.Networks = exports.Model = void 0;
const logger_1 = require("../../src/logger");
const debug = logger_1.logger("test:arbitraries:networks");
const fc = __importStar(require("fast-check"));
const fake_1 = require("./fake");
class Model {
    constructor() {
        this.byDescendantIndexThenHeight = [];
    }
    extendNetwork(descendantIndex, hash) {
        const networks = this.byDescendantIndexThenHeight[descendantIndex];
        const [latest] = networks.slice(-1);
        networks.push(Object.assign(Object.assign({}, latest), { historicBlock: {
                height: latest.historicBlock.height + 1,
                hash
            } }));
    }
    addNetwork(network) {
        this.byDescendantIndexThenHeight.push([network]);
    }
    forkNetwork(descendantIndex, leftHash, rightHash) {
        const networks = this.byDescendantIndexThenHeight[descendantIndex];
        const [latest] = networks.slice(-1);
        this.byDescendantIndexThenHeight.push([
            ...networks,
            Object.assign(Object.assign({}, latest), { historicBlock: {
                    height: latest.historicBlock.height + 1,
                    hash: rightHash
                } })
        ]);
        networks.push(Object.assign(Object.assign({}, latest), { historicBlock: {
                height: latest.historicBlock.height + 1,
                hash: leftHash
            } }));
    }
    get networks() {
        return this.byDescendantIndexThenHeight.map(networks => {
            const [latest] = networks.slice(-1);
            return Object.assign(Object.assign({}, latest), { getBlockByNumber: (height) => (networks[height] || {}).historicBlock });
        });
    }
}
exports.Model = Model;
const Hash = () => fc
    .hexaString({
    minLength: 32,
    maxLength: 32
})
    .map(hash => `0x${hash}`);
const Name = () => fake_1.fake("{{hacker.noun}}");
const NetworkId = () => fc.integer({ min: 1 });
var Commands;
(function (Commands) {
    Commands.AddNetwork = () => fc
        .tuple(Hash(), Name(), NetworkId())
        .map(([hash, name, networkId]) => (model) => {
        model.addNetwork({
            name,
            networkId,
            historicBlock: {
                height: 0,
                hash
            }
        });
    });
    Commands.ExtendNetwork = () => fc.tuple(fc.nat(), Hash()).map(([num, hash]) => (model) => {
        const descendantIndex = num % model.networks.length;
        model.extendNetwork(descendantIndex, hash);
    });
    Commands.ForkNetwork = () => fc
        .tuple(fc.nat(), Hash(), Hash())
        .map(([num, leftHash, rightHash]) => (model) => {
        const descendantIndex = num % model.networks.length;
        model.forkNetwork(descendantIndex, leftHash, rightHash);
    });
})(Commands || (Commands = {}));
const Networks = () => fc
    .tuple(Commands.AddNetwork(), fc.array(fc.frequency({
    arbitrary: Commands.AddNetwork(),
    weight: 1
}, {
    arbitrary: Commands.ExtendNetwork(),
    weight: 3
}, {
    arbitrary: Commands.ForkNetwork(),
    weight: 1
}), { maxLength: 50 }))
    .map(([addNetwork, commands]) => {
    const model = new Model();
    addNetwork(model);
    for (const command of commands) {
        command(model);
    }
    return model;
});
exports.Networks = Networks;
const Batch = (model) => {
    const { networks } = model;
    return fc
        .nat({
        max: networks.length - 1
    })
        .chain(descendantIndex => {
        const network = networks[descendantIndex];
        const maxHeight = network.historicBlock.height;
        return fc.record({
            descendantIndex: fc.constant(descendantIndex),
            inputs: fc.array(fc.nat({ max: maxHeight }).map(height => ({
                name: network.name,
                networkId: network.networkId,
                historicBlock: network.getBlockByNumber(height)
            })), { maxLength: 5 })
        });
    });
};
exports.Batch = Batch;
const Batches = (model) => fc.array(exports.Batch(model), { maxLength: 5 });
exports.Batches = Batches;
//# sourceMappingURL=networks.js.map