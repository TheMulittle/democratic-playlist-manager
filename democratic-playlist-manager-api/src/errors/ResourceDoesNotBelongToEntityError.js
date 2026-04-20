const GeneralError = require("./GeneralError");

class ResourceDoesNotBelongToEntityError extends GeneralError {
  constructor(resourceId, entityId, resource = "resource", entity = "entity") {
    super(
      `The given ${resource} [${resourceId}] does not belong to the ${entity} [${entityId}]`,
      400
    );
  }
}

module.exports = ResourceDoesNotBelongToEntityError;
