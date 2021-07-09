import execa from "execa";

it("can run", async () => {
  const res = await execa("node", ["./lib/cli.js", "--help"]);
  expect(res.stdout).toContain("video id or video url");
});
