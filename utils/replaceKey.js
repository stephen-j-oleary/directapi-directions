import _ from "lodash";

export default function replaceKey(object, oldKey, newKey) {
  const value = _.get(object, oldKey);
  _.set(object, newKey, value);
  _.unset(object, oldKey);
}
