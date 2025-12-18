minimo payload  para criar o checkout
/checkouts
```json
{
  "items": [
    {
      "quantity": 1,
      "unit_amount": 500,
      "description": "lua de mel"
    }
  ],
  "payment_methods_configs": [
    {
      "config_options": [
        {
          "option": "INSTALLMENTS_LIMIT",
          "value": "6"
        }
      ],
      "type": "CREDIT_CARD"
    },
    {
      "config_options": [
        {
          "option": "INSTALLMENTS_LIMIT",
          "value": "1"
        }
      ],
      "type": "DEBIT_CARD"
    }
  ],
  "customer_modifiable": true
}
```
