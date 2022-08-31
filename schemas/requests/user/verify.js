
import * as Yup from "yup";


const schemas = {
  post: Yup.object().shape({
    body: Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required(),
      scope: Yup.string()
    })
  })
};


export default schemas;
