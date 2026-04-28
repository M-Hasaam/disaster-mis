# MS SQL Server Connection Fix

Run all commands in an **elevated (Admin) PowerShell** session.

## Commands

```powershell
# Enable TCP/IP for SQL Express
Set-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp' -Name Enabled -Value 1

# Set static port 1433
Set-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp\IPAll' -Name TcpPort -Value '1433'

# Clear dynamic ports (so static port takes effect)
Set-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp\IPAll' -Name TcpDynamicPorts -Value ''

# Enable mixed auth mode (SQL Server + Windows Authentication)
Set-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQLServer' -Name LoginMode -Value 2

# Restart SQL Express and enable Browser service
Restart-Service 'MSSQL$SQLEXPRESS'
Start-Service SQLBrowser
Set-Service SQLBrowser -StartupType Automatic
```
