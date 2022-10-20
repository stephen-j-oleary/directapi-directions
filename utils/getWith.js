
import _ from "lodash";

export default function getWith(object, path, predicate = _.identity, defaultValue = undefined) {
  const value = _.get(object, path, defaultValue);
  return predicate(value)
    ? value
    : defaultValue;
}
