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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../../models/User");
describe('Auth Routes', () => {
    const testUser = {
        name: 'Test User1',
        email: 'testuser1@example.com',
        password: 'TestPass123!'
    };
    let refreshToken;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connect(process.env.MONGO_URI || '');
        yield User_1.User.deleteMany({ email: testUser.email });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.close();
    }));
    describe('POST /register', () => {
        it('should register a new user', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send(testUser);
            expect(res.status).toBe(201);
            if (res.body.email) {
                expect(res.body.email).toBe(testUser.email);
            }
        }));
        it('should not register with existing email', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send(testUser);
            expect(res.status).toBe(500);
        }));
    });
    describe('POST /login', () => {
        it('should login with correct credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: testUser.password });
            expect(res.status).toBe(200);
            expect(res.body.accessToken).toBeDefined();
            expect(res.body.refreshToken).toBeDefined();
            refreshToken = res.body.refreshToken;
        }));
        it('should not login with wrong password', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: 'wrongpass' });
            expect(res.status).toBe(500);
        }));
    });
    describe('POST /refresh', () => {
        it('should refresh access token with valid refresh token', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/refresh')
                .send({ refreshToken });
            expect(res.status).toBe(200);
            expect(res.body.accessToken).toBeDefined();
        }));
        it('should not refresh with invalid token', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalidtoken' });
            expect(res.status).toBe(500);
        }));
    });
    describe('POST /logout', () => {
        it('should logout user', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/logout')
                .send({ refreshToken });
            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/Logged Out Success!/i);
        }));
    });
});
