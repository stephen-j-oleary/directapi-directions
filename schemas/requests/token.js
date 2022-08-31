
import * as Yup from "yup";


const schemas = {
  post: Yup.object().shape({
    body: Yup.object().shape({
      grant_type: Yup.string()
        .required()
        .oneOf(["client_credetials", "authorization_code"]),
      scope: Yup.string(),
      code: Yup.string()
        .when("grant_type", {
          is: "authorization_code",
          then: schema => schema.required()
        }),
      redirect_uri: Yup.string()
        .when("grant_type", {
          is: "authorization_code",
          then: schema => schema.required()
        }),
      client_id: Yup.string()
        .when("grant_type", {
          is: "authorizatiuon_code",
          then: schema => schema.required()
        })
    })
  })
}


export default schemas;
