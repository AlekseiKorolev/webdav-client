const path = require("path");
const fileExists = require("exists-file").sync;
const directoryExists = require("directory-exists").sync;

describe("copyFile", function() {
    beforeEach(function() {
        this.client = createWebDAVClient("http://localhost:9988/webdav/server", {
            username: createWebDAVServer.test.username,
            password: createWebDAVServer.test.password
        });
        clean();
        this.server = createWebDAVServer();
        return this.server.start();
    });

    afterEach(function() {
        return this.server.stop();
    });

    it("copies files from one directory to another", function() {
        return this.client.copyFile("/alrighty.jpg", "/sub1/alrighty.jpg").then(function() {
            expect(fileExists(path.resolve(__dirname, "../testContents/alrighty.jpg"))).to.be.true;
            expect(fileExists(path.resolve(__dirname, "../testContents/sub1/alrighty.jpg"))).to.be.true;
        });
    });

    it("copies directories from one directory to another", function() {
        return this.client.copyFile("/webdav", "/sub1/webdav").then(function() {
            expect(directoryExists(path.resolve(__dirname, "../testContents/webdav"))).to.be.true;
            expect(directoryExists(path.resolve(__dirname, "../testContents/sub1/webdav"))).to.be.true;
        });
    });

    it("copies files with special characters", function() {
        return this.client.copyFile("/sub1/ยากจน #1.txt", "/sub1/ยากจน #2.txt").then(function() {
            expect(fileExists(path.resolve(__dirname, "../testContents/sub1/ยากจน #2.txt"))).to.be.true;
        });
    });
});
