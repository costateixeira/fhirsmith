const {CodeSystemProvider} = require("./cs-api");

class BaseCSServices extends CodeSystemProvider {

  _addProperty(params, type, name, value, language = null) {

    const property = {
      name: type,
      part: [
        {name: 'code', valueCode: name},
        {name: 'value', valueString: value}
      ]
    };

    if (language) {
      property.part.push({name: 'language', valueCode: language});
    }

    params.push(property);
  }


  _addCodeProperty(params, type, name, value, language = null, description = null) {

    const property = {
      name: type,
      part: [
        {name: 'code', valueCode: name},
        {name: 'value', valueCode: value}
      ]
    };

    if (language) {
      property.part.push({name: 'language', valueCode: language});
    }
    if (description) {
      property.part.push({name: 'description', valueString: description});
    }

    params.push(property);
    return property;
  }

  _addStringProperty(params, type, name, value, language = null) {

    const property = {
      name: type,
      part: [
        {name: 'code', valueCode: name},
        {name: 'value', valueString: value}
      ]
    };

    if (language) {
      property.part.push({name: 'language', valueCode: language});
    }

    params.push(property);
    return property;
  }


  // Helper to check if a property should be included
  _hasProp = (props, name, defaultValue = true) => {
    if (!props || props.length === 0) {
      return defaultValue;
    }
    const lowerName = name.toLowerCase();
    return props.some(p =>
      p.toLowerCase() === lowerName || p === '*'
    );
  };
}


module.exports = {
  BaseCSServices
};