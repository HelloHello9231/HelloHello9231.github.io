// import ExpenseIncome from "./Components/ExpenseIncome.js";

class App extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state =
    {
      Transactions: JSON.parse(localStorage.getItem("Transactions")) || [],
      Categories: JSON.parse(localStorage.getItem("Categories")) || ["General"],
    }

  }

  updateTransactions = (tName,tType,tCategory,tValue) =>
  {
    if(validateControlledInput([tName,tType,tCategory,tValue]))

    if(tType === "Income")
    {
      let transArr = this.state.Transactions.slice();
      transArr.push({tName,tType,tValue,date: Date()});

      localStorage.setItem("Transactions",JSON.stringify(transArr));
      this.setState(
        {
          Transactions: transArr,
        })
    }
    else if(tType === "Expense")
    {
      let transArr = this.state.Transactions.slice();
      transArr.push({tName,tType,tValue,tCategory,date: Date()});

      localStorage.setItem("Transactions",JSON.stringify(transArr));
      this.setState(
        {
          Transactions: transArr,
        })
    }
  }

  updateCategories = (name) =>
  {
    if(this.state.Categories.indexOf(name) !== -1 || name === " ") return alert("This is already a categroy");

    let catsArr = this.state.Categories.slice();

    catsArr.push(name);

    localStorage.setItem("Categories",JSON.stringify(catsArr));
    this.setState(
      {
        Categories: catsArr
      })

  }


  calcIncome()
  {
    let income = 0;

    this.state.Transactions.forEach((transaction) =>
    {
      if(transaction.tType === "Income") income += parseInt(transaction.tValue);
    })

    return income;
  }

  calcExpense()
  {
    let expense = 0;

    this.state.Transactions.forEach((transaction) =>
    {
      if(transaction.tType === "Expense") expense += parseInt(transaction.tValue);
    })

    return expense
  }

  calcBalance()
  {
    return this.calcIncome() - this.calcExpense();
  }

  resetData = () =>
  {
    localStorage.removeItem("Categories");
    localStorage.removeItem("Transactions");
    this.setState(
      {
        Transactions: JSON.parse(localStorage.getItem("Transactions")) || [],
        Categories: JSON.parse(localStorage.getItem("Categories")) || ["General"],
      })
  }

  deleteTransaction = (transactionObj) =>
  {
    let arrCopy = this.state.Transactions.slice();

    for(let i = 0; i < arrCopy.length; i++)
    {
      if(arrCopy[i].date === transactionObj.date) arrCopy.splice(i,1);
    }

    localStorage.setItem("Transactions",JSON.stringify(arrCopy));

    this.setState(
      {
        Transactions: arrCopy
      })

  }

  render()
  {
    return (
      <div className="everything-container">

      <h1 className="app-heading">Finance Tracker</h1>

      <ExpenseIncome Income={this.calcIncome()} Expense={this.calcExpense()} Balance={this.calcBalance()}/>

      <InputArea updateTransactions={this.updateTransactions} Categories={this.state.Categories}/>

      <div className="essentail-data">

      <TransactionHistory Transactions={this.state.Transactions} removeMethod={this.deleteTransaction}/>

      <CategoriesDisplay Transactions={this.state.Transactions} Categories={this.state.Categories} updateCategories={this.updateCategories} removeMethod={this.deleteTransaction}/>
      </div>

      <ResetData method={this.resetData}/>
      </div>

    );
  }
}

class ExpenseIncome extends React.Component
{
  constructor(props)
  {
    super(props);
  }

  render()
  {
    return (
      <div className="basic-data">
      <div className="data-card">
      <h2>Balance</h2>
      <h3>${this.props.Balance}</h3>
      </div>

      <div className="data-card">
      <h2>Income</h2>
      <h3>${this.props.Income}</h3>
      </div>

      <div className="data-card">
      <h2>Expense</h2>
      <h3>${this.props.Expense}</h3>
      </div>
      </div>
    );
  }
}

class InputArea extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state =
    {
      transactionName: " ",
      transactionType: "Income",
      transactionCategory: "General",
      transactionValue: " ",
    }
  }

  updateSettings = inputName => event =>
  {
    this.setState(
      {
        [inputName]: event.target.value
      })

  }

  makeTransaction = () =>
  {
    this.props.updateTransactions(...Object.values(this.state));

    this.setState(
      {
        transactionName: " ",
        transactionValue: " ",
      })
  }

  render()
  {
    let categoryInput;

    if(this.state.transactionType === "Expense")
    {
      let options = [ ];

      for(let cat of this.props.Categories)
      {
        options.push(<option value={cat}>{cat}</option>)
      }

      categoryInput = <select onChange={this.updateSettings("transactionCategory")} value={this.state.transactionCategory}>
      {options}
      </select>
    }
    else
    {
      categoryInput = <select>
      <option>none</option>
      </select>
    }

    return (
      <div className="data-section-input">

      <div>
      <select onChange={this.updateSettings("transactionType")}>
      <option value="Income">Income</option>
      <option value="Expense">Expense</option>
      </select>

      {categoryInput}
      </div>
      <input type="number" placeholder="Amount"  onChange={this.updateSettings("transactionValue")} min="0" value={this.state.transactionValue}/>
      <input type="text" placeholder="Name"  onChange={this.updateSettings("transactionName")} maxlength="20" value={this.state.transactionName}/>
      <button  onClick={this.makeTransaction}>Make Transaction</button>
      </div>
    );
  }
}

function validateControlledInput(values)
{
  return values.every(value =>
    {
      return value !== " ";
    })
}

function TransactionHistory(props)
{
  let elements = props.Transactions.sort((first,second) =>
  {
    return new Date(second.date) - new Date(first.date);
  }).map((transaction,index) =>
  {
     return <TransactionComponent tName={transaction.tName} tValue={transaction.tValue} tType={transaction.tType} removeMethod={props.removeMethod} obj={transaction}/>

  })

  return (<div className="data-section">
  <h1>Transaction History</h1>
  <ul>
  {elements}
  </ul></div>);
}

class CategoriesDisplay extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state =
    {
      currentSelectedCategory: " ",
      categoryName: " "
    }

  }

  selectCategory = (categoryName) =>
  {
    this.setState(
      {
        currentSelectedCategory: categoryName
      });
  }

  getTransactionsForCategory = (categoryName) =>
  {
    return this.props.Transactions.filter(trans => trans.tType === "Expense" && trans.tCategory === categoryName).sort((first,second) =>
    {
      return second.tValue - first.tValue;
    });
  }

  calculateTotalForCategory = (categoryName) =>
  {
    let total = 0;

    this.props.Transactions.forEach((action) =>
    {
      if(action.tType === "Expense" && action.tCategory === categoryName) total += parseInt(action.tValue);
    });

    return total;
  }

  changeCategoryName = (event) =>
  {
    this.setState(
      {
        categoryName: event.target.value
      })
  }

  createCategory = () =>
  {
    this.props.updateCategories(this.state.categoryName);

    this.setState(
      {
        categoryName: " "
      })
  }

  render()
  {
    if(this.state.currentSelectedCategory !== " ")
    {
      let uiElements = this.getTransactionsForCategory(this.state.currentSelectedCategory).map(trans =>
        {
          return <TransactionComponent tName={trans.tName} tValue={trans.tValue} tType={trans.tType} removeMethod={this.props.removeMethod} obj={trans}/>
        })

      return (<div className="data-section">
      <h1>{this.state.currentSelectedCategory}</h1>
      <ul>
      {uiElements}
      </ul>
      <button onClick={() => { this.selectCategory(" ")} }>Back</button>
      </div>);
    }

      let allCategoriesUI = this.props.Categories.sort((first,second) => this.calculateTotalForCategory(second) - this.calculateTotalForCategory(first)).map(cat =>
      {
          return <div onClick={() => {this.selectCategory(cat)}} className="basic-card cat"><h3>{cat}</h3> <h4>${this.calculateTotalForCategory(cat)}</h4></div>
      })

      return (<div className="data-section">
     <h1>All Categories</h1>
     <ul>
     {allCategoriesUI}
     </ul>

     <div className="category-input">
     <input type="text" placeholder="Category Name" onChange={this.changeCategoryName} value={this.state.categoryName}/>
     <button onClick={this.createCategory}>Create Category</button>
     </div>

    </div>);
  }
}


function ResetData(props)
{
  return (<div className="reset"><button onClick={props.method}>Reset Data</button></div>);
}

function TransactionComponent(props)
{
  if(props.tType === "Income")
  {
    return (<div className="income basic-card">
    <div>
    <h3>{props.tName}</h3>
    <h4>${props.tValue}</h4>
    </div>
    <span onClick={() => {props.removeMethod(props.obj)}}>X</span></div>);
  }
  else
  {
      return (<div className="expense basic-card">
      <div>
      <h3>{props.tName}</h3>
      <h4>${props.tValue}</h4>
      </div>
      <span onClick={() => {props.removeMethod(props.obj)}}>X</span></div>);
  }
}

ReactDOM.render(<App />,document.getElementById("body"));
