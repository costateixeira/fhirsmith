const {getValuePrimitive, getValueDT} = require("../../library/utilities");
const {parametersToR5} = require("../xversion/xv-parameters");

class Parameters {
  jsonObj;

  constructor (jsonObj = null, fhirVersion = 'R5') {
    this.jsonObj = parametersToR5(jsonObj ? jsonObj : { "resourceType": "Parameters" }, fhirVersion);
  }

  addParamStr(name, value) {
    if (!this.jsonObj.parameter) {
      this.jsonObj.parameter = [];
    }
    let p = this.jsonObj.parameter.find(x => x.name === name);
    if (p) {
      p.valueString = value;
    } else {
      this.jsonObj.parameter.push({name: name, valueString: value});
    }
  }

  addParam(name, valuename, value) {
    if (!this.jsonObj.parameter) {
      this.jsonObj.parameter = [];
    }
    let p = this.jsonObj.parameter.find(x => x.name === name);
    if (p) {
      p[valuename] = value;
    } else {
      let v = {name: name};
      v[valuename] = value;
      this.jsonObj.parameter.push(v);
    }
  }

  addParamUri(name, value) {
    if (!this.jsonObj.parameter) {
      this.jsonObj.parameter = [];
    }
    let p = this.jsonObj.parameter.find(x => x.name === name);
    if (p) {
      p.valueUri = value;
    } else {
      this.jsonObj.parameter.push({name: name, valueUri: value});
    }
  }

  addParamCanonical(name, value) {
    if (!this.jsonObj.parameter) {
      this.jsonObj.parameter = [];
    }
    let p = this.jsonObj.parameter.find(x => x.name === name);
    if (p) {
      p.valueCanonical = value;
    } else {
      this.jsonObj.parameter.push({name: name, valueCanonical: value});
    }
  }

  addParamCode(name, value) {
    if (!this.jsonObj.parameter) {
      this.jsonObj.parameter = [];
    }
    let p = this.jsonObj.parameter.find(x => x.name === name);
    if (p) {
      p.valueCode = value;
    } else {
      this.jsonObj.parameter.push({name: name, valueCode: value});
    }
  }

  addParamBool(name, value) {
    if (!this.jsonObj.parameter) {
      this.jsonObj.parameter = [];
    }
    let p = this.jsonObj.parameter.find(x => x.name === name);
    if (p) {
      p.valueBoolean = value;
    } else {
      this.jsonObj.parameter.push({name: name, valueBoolean: value});
    }
  }

  addParamResource(name, resource) {
    if (!this.jsonObj.parameter) {
      this.jsonObj.parameter = [];
    }
    this.jsonObj.parameter.push({ name: name, resource : resource });
  }

  has(name) {
    return this.jsonObj.parameter.find(x => x.name === name);
  }
  get(name) {
    let p = this.jsonObj.parameter.find(x => x.name === name);
    let v = p ? getValuePrimitive(p) : null;
    if (p && !v) {
      v = getValueDT(p);
    }
    return v;
  }

}

module.exports = { Parameters };