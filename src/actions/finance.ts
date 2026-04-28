import { query, mssql } from '@/lib/db'

export async function recordDonation(donor_name: string, amount: number, type: string, disaster_event: string) {
    const res = await query('INSERT INTO Donations (donor_name, amount, type, disaster_event, donated_at) OUTPUT INSERTED.donation_id VALUES (@donor,@amt,@type,@de,GETUTCDATE())', {
        donor: { type: mssql.VarChar(256), value: donor_name },
        amt: { type: mssql.Decimal(18, 2), value: amount },
        type: { type: mssql.VarChar(100), value: type },
        de: { type: mssql.VarChar(200), value: disaster_event },
    })
    return res.recordset[0]
}

export async function recordExpense(category: string, amount: number, disaster_event: string) {
    const res = await query('INSERT INTO Expenses (category, amount, disaster_event, incurred_at) OUTPUT INSERTED.expense_id VALUES (@cat,@amt,@de,GETUTCDATE())', {
        cat: { type: mssql.VarChar(200), value: category },
        amt: { type: mssql.Decimal(18, 2), value: amount },
        de: { type: mssql.VarChar(200), value: disaster_event },
    })
    return res.recordset[0]
}
