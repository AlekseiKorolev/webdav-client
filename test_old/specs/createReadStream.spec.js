const ReadableStream = require("stream").Readable;

function streamToBuffer(stream) {
    const buffs = [];
    return new Promise(function(resolve) {
        stream.on("data", function(d) {
            buffs.push(d);
        });
        stream.on("end", function() {
            resolve(Buffer.concat(buffs));
        });
    });
}

describe("createReadStream", function() {
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

    it("streams contents of a remote file", function() {
        const stream = this.client.createReadStream("/alrighty.jpg");
        expect(stream instanceof ReadableStream).to.be.true;
        return streamToBuffer(stream).then(function(buff) {
            expect(buff.length).to.equal(52130);
        });
    });

    it("streams portions (ranges) of a remote file", function() {
        const stream1 = this.client.createReadStream("/alrighty.jpg", {
            range: { start: 0, end: 24999 }
        });
        const stream2 = this.client.createReadStream("/alrighty.jpg", {
            range: { start: 25000, end: 52129 }
        });
        return Promise.all([streamToBuffer(stream1), streamToBuffer(stream2)]).then(function(buffers) {
            const part1 = buffers.shift();
            const part2 = buffers.shift();
            expect(part1.length).to.equal(25000);
            expect(part2.length).to.equal(27130);
        });
    });

    it("streams a partial file when only the start is provided", function() {
        const stream = this.client.createReadStream("/alrighty.jpg", {
            range: { start: 25000 }
        });
        return streamToBuffer(stream).then(function(buff) {
            expect(buff.length).to.equal(27130);
        });
    });
});
