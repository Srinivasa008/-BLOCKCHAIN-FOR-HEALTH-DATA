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
const utils_1 = require("./utils");
const source_graphql_1 = require("./source.graphql");
const compilation_graphql_1 = require("./compilation.graphql");
const compile_common_1 = require("@truffle/compile-common");
describe("Compilation", () => {
    const wsClient = new utils_1.WorkspaceClient();
    let sourceId;
    let variables, addCompilationResult;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        //add source and get id
        const sourceVariables = {
            contents: utils_1.Migrations.source,
            sourcePath: utils_1.Migrations.sourcePath
        };
        const sourceResult = (yield wsClient.execute(source_graphql_1.AddSource, sourceVariables));
        sourceId = sourceResult.sourcesAdd.sources[0].id;
        const shimmedBytecode = compile_common_1.Shims.LegacyToNew.forBytecode(utils_1.Migrations.bytecode);
        const bytecodeExpectedId = utils_1.generateId("bytecodes", shimmedBytecode);
        variables = {
            compilerName: utils_1.Migrations.compiler.name,
            compilerVersion: utils_1.Migrations.compiler.version,
            sourceId: sourceId,
            bytecodeId: "",
            abi: JSON.stringify(utils_1.Migrations.abi),
            sourceMap: JSON.stringify(utils_1.Migrations.sourceMap),
            language: "Solidity",
            astNode: "1",
            length: 5,
            offset: 16,
            contractBytecodeId: bytecodeExpectedId
        };
        addCompilationResult = yield wsClient.execute(compilation_graphql_1.AddCompilation, variables);
    }));
    test("can be added", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(addCompilationResult).toHaveProperty("compilationsAdd");
        const { compilationsAdd } = addCompilationResult;
        expect(compilationsAdd).toHaveProperty("compilations");
        const { compilations } = compilationsAdd;
        expect(compilations).toHaveLength(1);
        for (let compilation of compilations) {
            expect(compilation).toHaveProperty("compiler");
            expect(compilation).toHaveProperty("sources");
            const { compiler, sources, processedSources, immutableReferences } = compilation;
            expect(compiler).toHaveProperty("name");
            expect(sources).toHaveLength(1);
            for (let source of sources) {
                expect(source).toHaveProperty("contents");
            }
            expect(processedSources).toHaveLength(1);
            for (let processedSource of processedSources) {
                expect(processedSource).toHaveProperty("source");
                expect(processedSource).toHaveProperty("ast");
                expect(processedSource).toHaveProperty("language");
            }
            expect(immutableReferences).toHaveLength(1);
            expect(immutableReferences[0].astNode).toEqual(variables.astNode);
            expect(immutableReferences[0].offsets).toHaveLength(1);
            expect(immutableReferences[0].length).toEqual(variables.length);
            expect(immutableReferences[0].offsets[0]).toEqual(variables.offset);
        }
    }));
    test("can be queried", () => __awaiter(void 0, void 0, void 0, function* () {
        const expectedId = utils_1.generateId("compilations", {
            compiler: utils_1.Migrations.compiler,
            sources: [{ id: sourceId }]
        });
        const getCompilationResult = (yield wsClient.execute(compilation_graphql_1.GetCompilation, {
            id: expectedId
        }));
        expect(getCompilationResult).toHaveProperty("compilation");
        const { compilation } = getCompilationResult;
        expect(compilation).toBeDefined();
        expect(compilation).toHaveProperty("id");
        expect(compilation).toHaveProperty("compiler");
        expect(compilation).toHaveProperty("sources");
        // @ts-ignore covered by toBeDefined()
        const { sources, immutableReferences } = compilation;
        for (let source of sources) {
            expect(source).toHaveProperty("id");
            const { id } = source;
            expect(id).not.toBeNull();
            expect(source).toHaveProperty("contents");
            const { contents } = source;
            expect(contents).not.toBeNull();
        }
        expect(immutableReferences).toHaveLength(1);
        expect(immutableReferences[0].astNode).toEqual(variables.astNode);
        expect(immutableReferences[0].offsets).toHaveLength(1);
        expect(immutableReferences[0].length).toEqual(variables.length);
        expect(immutableReferences[0].offsets[0]).toEqual(variables.offset);
    }));
    test("can retrieve all compilations", () => __awaiter(void 0, void 0, void 0, function* () {
        const allCompilationsResult = (yield wsClient.execute(compilation_graphql_1.GetAllCompilations, {}));
        expect(allCompilationsResult).toHaveProperty("compilations");
        const { compilations } = allCompilationsResult;
        expect(compilations).toHaveProperty("length");
        const firstCompilation = compilations[0];
        expect(firstCompilation).toHaveProperty("compiler");
        expect(firstCompilation).toHaveProperty("sources");
        expect(firstCompilation).toHaveProperty("sources.0.id");
    }));
});
//# sourceMappingURL=compilation.spec.js.map