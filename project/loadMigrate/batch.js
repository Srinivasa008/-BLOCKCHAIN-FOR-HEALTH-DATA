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
exports.configure = void 0;
/**
 * @category Internal boilerplate
 * @packageDocumentation
 */
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:project:loadMigrate:batch");
const Base = __importStar(require("../batch"));
const configure = (options) => Base.configure(Object.assign({ *iterate({ inputs: { artifacts, network: { networkId } } }) {
        for (const [artifactIndex, artifact] of artifacts.entries()) {
            if (!artifact.networks) {
                continue;
            }
            const artifactNetwork = artifact.networks[networkId];
            if (!artifactNetwork) {
                continue;
            }
            yield {
                input: artifactNetwork,
                breadcrumb: { artifactIndex }
            };
        }
    },
    find({ inputs: { artifacts, network: { networkId } }, breadcrumb }) {
        const { artifactIndex } = breadcrumb;
        return (artifacts[artifactIndex].networks || {})[networkId];
    }, initialize({ inputs: { artifacts, network } }) {
        return {
            network,
            artifacts: artifacts.map(artifact => (Object.assign(Object.assign({}, artifact), { networks: Object.assign({}, artifact.networks) })))
        };
    },
    merge({ outputs: { network, artifacts }, breadcrumb, output }) {
        debug("output %o", output);
        const { networkId } = network;
        const { artifactIndex } = breadcrumb;
        const artifactsBefore = artifacts.slice(0, artifactIndex);
        const artifact = artifacts[artifactIndex];
        const artifactsAfter = artifacts.slice(artifactIndex + 1);
        const artifactNetwork = Object.assign(Object.assign({}, (artifact.networks || {})[networkId]), output);
        return {
            network,
            artifacts: [
                ...artifactsBefore,
                Object.assign(Object.assign({}, artifact), { networks: Object.assign(Object.assign({}, artifact.networks), { [networkId]: artifactNetwork }) }),
                ...artifactsAfter
            ]
        };
    } }, options));
exports.configure = configure;
//# sourceMappingURL=batch.js.map