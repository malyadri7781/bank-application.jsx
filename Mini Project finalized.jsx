import React, { useState } from "react";
class Account {
  static bankname = "State Bank of India";

  constructor(name, balance, minBalance, pin) {
    this.name = name;
    this.balance = Number(balance);
    this.minBalance = Number(minBalance);
    this.accountNumber = this.generateAccNo();
    this.pin = pin;
    this.history = [];
  }

  generateAccNo() {
    return "SBI" + Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  authenticate(pin) {
    return this.pin === pin;
  }

  addHistory(type, amount) {
    const timestamp = new Date().toLocaleString();
    this.history.push(`${timestamp} | ${type} | ₹${Number(amount).toFixed(2)} | Balance: ₹${this.balance.toFixed(2)}`);
  }

  deposit(amount) {
    this.balance += Number(amount);
    this.addHistory("Deposit", amount);
  }

  withdraw(amount) {
    amount = Number(amount);
    // Enforce minimum balance of ₹1000
    if (this.balance - amount >= 1000) {
      this.balance -= amount;
      this.addHistory("Withdraw", amount);
      return true;
    } else {
      return false;
    }
  }

  addInterest(rate) {
    const interest = this.balance * (Number(rate) / 100);
    this.balance += interest;
    this.addHistory("Interest Added", interest);
  }
}

class Savings extends Account {
  constructor(name, balance, pin) {
    super(name, balance, 1000, pin);
  }

  toString() {
    return `${this.name}'s Savings Account (A/C: ${this.accountNumber}) Balance: ₹${this.balance.toFixed(2)}`;
  }
}

class Current extends Account {
  constructor(name, balance, pin) {
    super(name, balance, 1000, pin);
  }

  toString() {
    return `${this.name}'s Current Account (A/C: ${this.accountNumber}) Balance: ₹${this.balance.toFixed(2)}`;
  }
}

// --- React Component ---
export default function BankingWebApp() {
  const [step, setStep] = useState("create"); // create -> login -> dashboard
  const [account, setAccount] = useState(null);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [type, setType] = useState("savings");
  const [initialBalance, setInitialBalance] = useState(10000);
  const [loginPin, setLoginPin] = useState("");
  const [message, setMessage] = useState("");

  // action states
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");

  function handleCreate(e) {
    e.preventDefault();
    if (!name.trim() || !pin.trim()) {
      setMessage("Please provide name and PIN.");
      return;
    }
    const initial = Number(initialBalance) || 0;
    let acct;
    if (type === "savings") acct = new Savings(name.trim(), initial, pin);
    else acct = new Current(name.trim(), initial, pin);
    acct.addHistory("Account Created", acct.balance);
    setAccount(acct);
    setMessage("");
    setStep("login");
  }

  function handleLogin(e) {
    e.preventDefault();
    if (!account) return;
    if (account.authenticate(loginPin)) {
      setMessage("");
      setStep("dashboard");
    } else {
      setMessage("Incorrect PIN! Access Denied.");
    }
  }

  function doDeposit(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setMessage("Enter a positive amount to deposit.");
      return;
    }
    account.deposit(Number(amount));
    // trigger re-render by updating state reference
    setAccount(Object.assign(Object.create(Object.getPrototypeOf(account)), account));
    setMessage(`Deposited ₹${Number(amount).toFixed(2)} successfully.`);
    setAmount("");
  }

  function doWithdraw(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setMessage("Enter a positive amount to withdraw.");
      return;
    }
    const ok = account.withdraw(Number(amount));
    if (!ok) setMessage("Sorry! Insufficient Funds.");
    else setMessage(`Withdrew ₹${Number(amount).toFixed(2)} successfully.`);
    setAccount(Object.assign(Object.create(Object.getPrototypeOf(account)), account));
    setAmount("");
  }

  function doInterest(e) {
    e.preventDefault();
    if (!rate || Number(rate) <= 0) {
      setMessage("Enter a positive interest rate.");
      return;
    }
    account.addInterest(Number(rate));
    setAccount(Object.assign(Object.create(Object.getPrototypeOf(account)), account));
    setMessage(`Interest added at ${Number(rate)}% rate.`);
    setRate("");
  }

  function logout() {
    setStep("login");
    setLoginPin("");
    setMessage("Logged out.");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-start justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">{Account.bankname} — Mini Banking Web App</h1>
          <div className="text-sm text-gray-600">Demo (no server) • All data in memory</div>
        </header>

        {step === "create" && (
          <form onSubmit={handleCreate} className="space-y-4">
            <h2 className="text-lg font-medium">Create Account</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm">Full name</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm">PIN</label>
                <input
                  type="password"
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm">Account Type</label>
                <select className="mt-1 w-full border rounded px-3 py-2" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">Initial Balance</label>
                <input
                  type="number"
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
                Create Account
              </button>
              <button type="button" className="px-3 py-2" onClick={() => { setName(''); setPin(''); setInitialBalance(10000); setType('savings'); }}>
                Reset
              </button>
            </div>

            {message && <div className="text-sm text-red-600">{message}</div>}
          </form>
        )}

        {step === "login" && account && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Account Created</h2>
            <div className="p-3 bg-gray-50 rounded">
  {account.balance < 1000 && (
    <div className="text-red-600 text-sm mb-2">⚠ Minimum balance should be ₹1000</div>
  )}
              <div><strong>Holder:</strong> {account.name}</div>
              <div><strong>Account:</strong> {account.accountNumber}</div>
              <div><strong>Balance:</strong> ₹{account.balance.toFixed(2)}</div>
              <div className="text-xs text-gray-500 mt-1">Set PIN during creation — please login to continue.</div>
            </div>

            <form onSubmit={handleLogin} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
              <div className="sm:col-span-2">
                <label className="block text-sm">Enter PIN to login</label>
                <input
                  type="password"
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  required
                />
              </div>
              <div>
                <button className="bg-green-600 text-white px-4 py-2 rounded w-full" type="submit">
                  Login
                </button>
              </div>
            </form>
            {message && <div className="text-sm text-red-600">{message}</div>}
          </div>
        )}

        {step === "dashboard" && account && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">Dashboard</h2>
                <div className="text-sm text-gray-600">{account.name} • {account.accountNumber}</div>
              </div>
              <div className="text-right">
                <div><strong>Balance</strong></div>
                <div className="text-2xl">₹{account.balance.toFixed(2)}</div>
                <button className="mt-2 text-sm text-blue-600" onClick={logout}>Logout</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 bg-gray-50 p-4 rounded space-y-3">
                <form onSubmit={doDeposit} className="flex gap-2 items-center">
                  <input type="number" placeholder="Amount" className="flex-1 border rounded px-3 py-2" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  <button className="bg-blue-600 text-white px-3 py-2 rounded" type="submit">Deposit</button>
                </form>

                <form onSubmit={doWithdraw} className="flex gap-2 items-center">
                  <input type="number" placeholder="Amount" className="flex-1 border rounded px-3 py-2" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  <button className="bg-red-600 text-white px-3 py-2 rounded" type="submit">Withdraw</button>
                </form>

                <form onSubmit={doInterest} className="flex gap-2 items-center">
                  <input type="number" placeholder="Interest Rate %" className="flex-1 border rounded px-3 py-2" value={rate} onChange={(e) => setRate(e.target.value)} />
                  <button className="bg-yellow-500 text-white px-3 py-2 rounded" type="submit">Add Interest</button>
                </form>

                {message && (
  <div className={`text-sm ${message.includes('Minimum balance') || message.includes('Insufficient') ? 'text-red-600' : 'text-green-700'}`}>{message}</div>
)}
              </div>

              <div className="bg-white border p-4 rounded">
                <h3 className="font-medium mb-2">Account Info</h3>
                <div><strong>Holder:</strong> {account.name}</div>
                <div><strong>Account No:</strong> {account.accountNumber}</div>
                <div><strong>Min Balance:</strong> ₹{account.minBalance.toFixed(2)}</div>
                <div className="mt-2">
                  <button className="text-sm text-indigo-600" onClick={() => { navigator.clipboard?.writeText(account.accountNumber); setMessage('Account number copied to clipboard.'); }}>Copy A/C</button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Transaction History</h3>
              <div className="max-h-48 overflow-auto border rounded p-3 bg-gray-50">
                {account.history.length === 0 && <div className="text-sm text-gray-500">No transactions yet.</div>}
                {account.history.map((h, idx) => (
                  <div key={idx} className="text-sm py-1 border-b last:border-b-0">{h}</div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium">Statement</h3>
              <div className="p-3 bg-gray-50 rounded">
                <div><strong>Current Balance:</strong> ₹{account.balance.toFixed(2)}</div>
                <div className="mt-2 text-xs text-gray-600">Use this web app for demo and learning. Data is not persisted between refreshes.</div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-6 text-xs text-gray-500">
          Built for demo — convert to a full app by adding a backend (API + DB) and proper security for PINs.
        </footer>
      </div>
    </div>
  );
}
