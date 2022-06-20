DB DESIGN DOC

GLOBAL_CONFIG:
    {
        last_updated_payment,invoice,
        last_updated_transaction,invoice,
    }

COMMODITIES_GROUP:
    {
        id,
        commodity_group_name,
        sub_commodities : [
            {
                sub_commodity_name,
                sub_commodity_quantity,
                sub_commodity_unit
            },
        ]
    }
 
USERS:
   {
       company_name,
       pan,
       gst_no,
       address,
       phone_no,
       email_id,
       bank_details :
           [
               {
               bank_name,
               account_number,
               ifsc
               }
           ]
   }
 
SUPPLIERS:
   {
       name,*
       address,*
       phone_no,*
       email_id,
       gst_no,
       pan_no,
       bank_name,
       account_holder_name,
       account_no,
       ifsc_code,
       amount
   }
 
CONSUMERS:
   {
       name,*
       address,*
       phone_no,*
       email_id,
       gst_no,
       pan_no,
       account_holder_name,
       account_no,
       ifsc_code,
       amount
   }

PAYMENTS:
    {
        payment_type,           // consumer / supplier
        payment_for,            // consumer id / supplier id
        commodity_group,        // id
        invoice_no,
        amount,
        date_of_payment,
        mode_of_payment,
        bank,
        account_holder_name,
        account_number,
        ifsc,
        dd_no,
        cheque_no,
        my_account_number,
        my_bank,
        payment_decscription
    }

TRANSACTIONS:
   { 
        transaction_type,           // consumer / supplier
        transaction_for,            // consumer id / supplier id
        commodity_group,            // name
        invoice_no,
        date_of_transaction,
        total,
        discount,
        net_total,                     //autofilled in UI
        sub_commodities :
            [
                {
                    sub_commodity_name,
                    sub_commodity_quantity,
                    sub_commodity_transacted_quantity,
                    sub_commodity_price_per_unit,
                    sub_commodity_price
                }
            ]
        transaction_description,
   }


SALES:
   { 
        sales_for,                      // consumer id
        commodity_group,                // name
        invoice_no,
        date_of_transaction,
        total,
        metric_ton,
        discount_per_metric_ton,
        discount,
        net_total,                      //autofilled in UI
        sub_commodities :
            [
                {
                    sub_commodity_name,
                    sub_commodity_quantity,
                    sub_commodity_transacted_quantity,
                    sub_commodity_price_per_unit,
                    sub_commodity_price
                }
            ]
        sales_description,
   }

PURCHASE:
   { 
        purchase_for,                   // supplier id
        commodity_group,                // name
        invoice_no,
        date_of_transaction,
        total,
        metric_ton,
        discount,
        net_total,                      //autofilled in UI
        sub_commodities :
            [
                {
                    sub_commodity_name,
                    sub_commodity_quantity,
                    sub_commodity_transacted_quantity,
                    sub_commodity_price_per_unit,
                    sub_commodity_price
                }
            ]
        purchase_description,
   }
