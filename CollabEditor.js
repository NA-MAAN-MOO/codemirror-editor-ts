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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var collab_1 = require("@codemirror/collab");
var codemirror_1 = require("codemirror");
var state_1 = require("@codemirror/state");
var view_1 = require("@codemirror/view");
document.querySelector("#addpeer").onclick = addPeer;
function pause(time) {
    return new Promise(function (resolve) { return setTimeout(resolve, time); });
}
function currentLatency() {
    var base = +document.querySelector("#latency").value;
    return base * (1 + (Math.random() - 0.5));
}
var Connection = /** @class */ (function () {
    function Connection(worker, getLatency) {
        if (getLatency === void 0) { getLatency = currentLatency; }
        this.worker = worker;
        this.getLatency = getLatency;
        this.disconnected = null;
    }
    Connection.prototype._request = function (value) {
        var _this = this;
        return new Promise(function (resolve) {
            var channel = new MessageChannel();
            channel.port2.onmessage = function (event) { return resolve(JSON.parse(event.data)); };
            _this.worker.postMessage(JSON.stringify(value), [channel.port1]);
        });
    };
    Connection.prototype.request = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var latency, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        latency = this.getLatency();
                        return [4 /*yield*/, (this.disconnected ? this.disconnected.wait : pause(latency))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._request(value)];
                    case 2:
                        result = _a.sent();
                        return [4 /*yield*/, (this.disconnected ? this.disconnected.wait : pause(latency))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Connection.prototype.setConnected = function (value) {
        if (value && this.disconnected) {
            this.disconnected.resolve();
            this.disconnected = null;
        }
        else if (!value && !this.disconnected) {
            var resolve_1, wait = new Promise(function (r) { return (resolve_1 = r); });
            this.disconnected = { wait: wait, resolve: resolve_1 };
        }
    };
    return Connection;
}());
//!wrappers
function pushUpdates(connection, version, fullUpdates) {
    // Strip off transaction data
    var updates = fullUpdates.map(function (u) { return ({
        clientID: u.clientID,
        changes: u.changes.toJSON()
    }); });
    return connection.request({ type: "pushUpdates", version: version, updates: updates });
}
function pullUpdates(connection, version) {
    return connection.request({ type: "pullUpdates", version: version }).then(function (updates) {
        return updates.map(function (u) { return ({
            changes: state_1.ChangeSet.fromJSON(u.changes),
            clientID: u.clientID
        }); });
    });
}
function getDocument(connection) {
    return connection.request({ type: "getDocument" }).then(function (data) { return ({
        version: data.version,
        doc: state_1.Text.of(data.doc.split("\n"))
    }); });
}
//!peerExtension
function peerExtension(startVersion, connection) {
    var plugin = view_1.ViewPlugin.fromClass(/** @class */ (function () {
        function class_1(view) {
            this.view = view;
            this.pushing = false;
            this.done = false;
            this.pull();
        }
        class_1.prototype.update = function (update) {
            if (update.docChanged)
                this.push();
        };
        class_1.prototype.push = function () {
            return __awaiter(this, void 0, void 0, function () {
                var updates, version;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            updates = (0, collab_1.sendableUpdates)(this.view.state);
                            if (this.pushing || !updates.length)
                                return [2 /*return*/];
                            this.pushing = true;
                            version = (0, collab_1.getSyncedVersion)(this.view.state);
                            return [4 /*yield*/, pushUpdates(connection, version, updates)];
                        case 1:
                            _a.sent();
                            this.pushing = false;
                            // Regardless of whether the push failed or new updates came in
                            // while it was running, try again if there's updates remaining
                            if ((0, collab_1.sendableUpdates)(this.view.state).length)
                                setTimeout(function () { return _this.push(); }, 100);
                            return [2 /*return*/];
                    }
                });
            });
        };
        class_1.prototype.pull = function () {
            return __awaiter(this, void 0, void 0, function () {
                var version, updates;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!this.done) return [3 /*break*/, 2];
                            version = (0, collab_1.getSyncedVersion)(this.view.state);
                            return [4 /*yield*/, pullUpdates(connection, version)];
                        case 1:
                            updates = _a.sent();
                            this.view.dispatch((0, collab_1.receiveUpdates)(this.view.state, updates));
                            return [3 /*break*/, 0];
                        case 2: return [2 /*return*/];
                    }
                });
            });
        };
        class_1.prototype.destroy = function () {
            this.done = true;
        };
        return class_1;
    }()));
    return [(0, collab_1.collab)({ startVersion: startVersion }), plugin];
}
//!rest
var worker = new Worker("./worker.js");
function addPeer() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, version, doc, connection, state, editors, wrap, cut;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDocument(new Connection(worker, function () { return 0; }))];
                case 1:
                    _a = _b.sent(), version = _a.version, doc = _a.doc;
                    connection = new Connection(worker);
                    state = state_1.EditorState.create({
                        doc: doc,
                        extensions: [codemirror_1.basicSetup, peerExtension(version, connection)]
                    });
                    editors = document.querySelector("#editors");
                    wrap = editors.appendChild(document.createElement("div"));
                    wrap.className = "editor";
                    cut = wrap.appendChild(document.createElement("div"));
                    cut.innerHTML =
                        "<label><input type=checkbox aria-description='Cut'>✂️</label>";
                    cut.className = "cut-control";
                    cut.querySelector("input").addEventListener("change", function (e) {
                        var isCut = e.target.checked;
                        wrap.classList.toggle("cut", isCut);
                        connection.setConnected(!isCut);
                    });
                    new view_1.EditorView({ state: state, parent: wrap });
                    return [2 /*return*/];
            }
        });
    });
}
addPeer();
addPeer();
