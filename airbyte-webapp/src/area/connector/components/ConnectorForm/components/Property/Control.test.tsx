import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { IntlProvider } from "react-intl";

import { FormBaseItem } from "core/form/types";

import { Control } from "./Control";

const TestWrapper: React.FC<{
  property: FormBaseItem;
  defaultValue?: number;
  onSubmit: (values: Record<string, unknown>) => void;
}> = ({ property, defaultValue, onSubmit }) => {
  const methods = useForm<{ testField?: number }>({ defaultValues: { testField: defaultValue } });

  return (
    <IntlProvider locale="en" messages={{}}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Control property={property} name="testField" />
          <button type="submit" data-testid="submit-btn">
            Submit
          </button>
        </form>
      </FormProvider>
    </IntlProvider>
  );
};

describe("Control - Enum selection", () => {
  it("allows selecting 0 in an integer enum dropdown (Issue #86461)", async () => {
    const handleSubmit = jest.fn();

    const integerEnumProperty: FormBaseItem = {
      _type: "formItem",
      type: "integer",
      fieldKey: "testField",
      path: "testField",
      enum: [0, 1, 7, 14, 30, 60],
      title: "View window days",
      isRequired: false,
    };

    render(<TestWrapper property={integerEnumProperty} defaultValue={30} onSubmit={handleSubmit} />);

    // Open the ListBox dropdown
    const dropdownButton = screen.getByTestId("testField-listbox-button");
    await userEvent.click(dropdownButton);

    // Click the "0" option
    const zeroOption = screen.getByRole("option", { name: "0" });
    await userEvent.click(zeroOption);

    // Submit the form
    await userEvent.click(screen.getByTestId("submit-btn"));

    // Verify that 0 was selected and passed to onSubmit
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          testField: 0,
        }),
        expect.anything()
      );
    });
  });
});
