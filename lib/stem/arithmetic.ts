import { VATCalculationResult } from "./types";

export function calculateNepalVAT(
  markedPrice: number,
  discountPercentage: number = 0,
  vatPercentage: number = 13
): VATCalculationResult {
  if (
    ![markedPrice, discountPercentage, vatPercentage].every(Number.isFinite) ||
    markedPrice < 0 ||
    discountPercentage < 0 ||
    discountPercentage > 100 ||
    vatPercentage < 0 ||
    vatPercentage > 100
  ) {
    throw new RangeError(
      "Price must be non-negative and percentage values must be between 0 and 100."
    );
  }

  const discountAmount = markedPrice * (discountPercentage / 100);
  const priceAfterDiscount = markedPrice - discountAmount;
  const vatAmount = priceAfterDiscount * (vatPercentage / 100);
  const finalSellingPrice = priceAfterDiscount + vatAmount;

  const stepsMarkdown = `
**Given:**
- Marked Price (MP) = Rs. ${markedPrice.toLocaleString()}
- Discount = ${discountPercentage}%
- VAT = ${vatPercentage}%

**Step 1: Calculate Discount Amount**
$$\\text{Discount} = \\text{MP} \\times \\frac{\\text{Discount}\\%}{100} = ${markedPrice} \\times \\frac{${discountPercentage}}{100} = \\text{Rs. } ${discountAmount.toFixed(2)}$$

**Step 2: Calculate Price after Discount (SP without VAT)**
$$\\text{SP} = \\text{MP} - \\text{Discount} = ${markedPrice} - ${discountAmount.toFixed(2)} = \\text{Rs. } ${priceAfterDiscount.toFixed(2)}$$

**Step 3: Calculate ${vatPercentage}% Value Added Tax (VAT)**
$$\\text{VAT Amount} = \\text{SP} \\times \\frac{${vatPercentage}}{100} = ${priceAfterDiscount.toFixed(2)} \\times ${(vatPercentage / 100).toFixed(4)} = \\text{Rs. } ${vatAmount.toFixed(2)}$$

**Step 4: Final Selling Price with VAT (SP with VAT)**
$$\\text{Final SP} = \\text{SP} + \\text{VAT} = ${priceAfterDiscount.toFixed(2)} + ${vatAmount.toFixed(2)} = \\mathbf{\\text{Rs. } ${finalSellingPrice.toFixed(2)}}$$
  `;

  return {
    markedPrice,
    discountPercentage,
    discountAmount,
    priceAfterDiscount,
    vatPercentage,
    vatAmount,
    finalSellingPrice,
    stepsMarkdown,
  };
}
