import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Frontend Registration Calculations and Validation Logic', () => {
  test('calculates multi-course total payable with individual course discounts', () => {
    const selectedCourses = [
      { courseId: '1', agreedFee: 15000, discount: 2000 },
      { courseId: '2', agreedFee: 8000, discount: 500 },
    ];

    const totalCourseFee = selectedCourses.reduce((sum, c) => sum + c.agreedFee, 0);
    const totalDiscount = selectedCourses.reduce((sum, c) => sum + c.discount, 0);
    const totalPayable = Math.max(0, totalCourseFee - totalDiscount);

    assert.strictEqual(totalCourseFee, 23000);
    assert.strictEqual(totalDiscount, 2500);
    assert.strictEqual(totalPayable, 20500);
  });

  test('calculates remaining due and prevents negative due balances', () => {
    const totalPayable = 20500;
    const advancePayment = 5000;
    const outstandingDue = Math.max(0, totalPayable - advancePayment);

    assert.strictEqual(outstandingDue, 15500);
  });

  test('validates Bangladeshi mobile number regex pattern', () => {
    const bdPhoneRegex = /^(\+?880|0)?1[3-9]\d{8}$/;

    assert.ok(bdPhoneRegex.test('01712345678'));
    assert.ok(bdPhoneRegex.test('01812345678'));
    assert.ok(bdPhoneRegex.test('+8801912345678'));
    assert.ok(bdPhoneRegex.test('01312345678'));

    // Invalid numbers
    assert.strictEqual(bdPhoneRegex.test('01212345678'), false); // Operator 2 doesn't exist
    assert.strictEqual(bdPhoneRegex.test('12345'), false);
    assert.strictEqual(bdPhoneRegex.test('0171234567899'), false); // Too long
  });
});
