
import * as Yup from "yup";


const schemas = {
  get: Yup.object().shape({
    query: Yup.object().shape({
      response_type: Yup.string()
        .required()
        .oneOf(["code"]),
      client_id: Yup.string()
        .required(),
      redirect_uri: Yup.string()
        .required(),
      scope: Yup.string(),
      state: Yup.string()
    })
  })
};


export default schemas;
