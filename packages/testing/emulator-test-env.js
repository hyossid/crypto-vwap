/* eslint-disable @typescript-eslint/no-var-requires */
const NodeEnvironment =
  require('jest-environment-node').default ?? require('jest-environment-node');

class ShimTestEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
  }
  async setup() {
    await super.setup();
    this.global.BigInt.prototype.toJSON = function () {
      return this.toString();
    };
  }
  async teardown() {
    await super.teardown();
  }
}
module.exports = ShimTestEnvironment;
