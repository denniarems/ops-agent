import * as React from "react"
import { useFormContext } from "react-hook-form"
import { FormFieldContext, FormItemContext } from "./form-context" // Adjusted import path

export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  // Ensure itemContext is available before accessing its id
  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>")
  }


  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}
