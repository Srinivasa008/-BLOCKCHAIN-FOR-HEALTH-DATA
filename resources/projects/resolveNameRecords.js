"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveNameRecords = void 0;
const logger_1 = require("../../logger");
const debug = logger_1.logger("db:resources:projects:resolveNameRecords");
function resolveNameRecords(project, inputs, context, _) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = project;
        const { name, type } = inputs;
        const { workspace } = context;
        const projectNames = yield workspace.find("projectNames", {
            selector: {
                "project.id": id,
                "key.name": name,
                "key.type": type
            }
        });
        const nameRecords = yield workspace.find("nameRecords", projectNames.map(projectName => projectName === null || projectName === void 0 ? void 0 : projectName.nameRecord));
        return nameRecords.filter((nameRecord) => !!nameRecord);
    });
}
exports.resolveNameRecords = resolveNameRecords;
//# sourceMappingURL=resolveNameRecords.js.map