import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import financeImage from "@/assets/finance-dashboard.jpg";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  CreditCard, 
  Wallet,
  Target,
  Calendar,
  Plus
} from "lucide-react";
import TransactionForm from "@/components/transactions/TransactionForm";
import BudgetManager from "@/components/budget/BudgetManager";

const FinanceDashboard = () => {
  const budgetCategories = [
    { name: "Housing", spent: 1200, budget: 1500, color: "bg-primary" },
    { name: "Food", spent: 650, budget: 800, color: "bg-secondary" },
    { name: "Transportation", spent: 300, budget: 400, color: "bg-success" },
    { name: "Entertainment", spent: 180, budget: 300, color: "bg-warning" },
    { name: "Shopping", spent: 420, budget: 500, color: "bg-purple-500" },
  ];

  const recentTransactions = [
    { id: 1, description: "Grocery Store", amount: -85.32, date: "Today", category: "Food" },
    { id: 2, description: "Salary Deposit", amount: 3500.00, date: "Dec 1", category: "Income" },
    { id: 3, description: "Coffee Shop", amount: -12.50, date: "Yesterday", category: "Food" },
    { id: 4, description: "Gas Station", amount: -45.00, date: "Dec 2", category: "Transportation" },
    { id: 5, description: "Movie Tickets", amount: -28.00, date: "Dec 2", category: "Entertainment" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/30 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-display font-bold gradient-text mb-2">
                Financial Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Track your shared expenses and build your future together
              </p>
            </div>
            <TransactionForm trigger={
              <Button className="btn-primary" size="lg">
                <Plus size={20} />
                Add Transaction
              </Button>
            } />
          </div>
          
          <div className="relative h-48 rounded-2xl overflow-hidden mb-8">
            <img 
              src={financeImage} 
              alt="Financial Dashboard" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-2xl font-display font-semibold mb-2">December 2024</h2>
                <p className="text-lg opacity-90">Building wealth together, one step at a time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-success to-success/80 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <Badge variant="secondary" className="bg-success/10 text-success">
                  +12.5%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-success mb-1">$8,420</h3>
              <p className="text-muted-foreground text-sm">Monthly Income</p>
            </CardContent>
          </Card>

          <Card className="card-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-destructive to-destructive/80 rounded-full flex items-center justify-center">
                  <TrendingDown className="text-white" size={24} />
                </div>
                <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                  +8.2%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-destructive mb-1">$3,245</h3>
              <p className="text-muted-foreground text-sm">Monthly Expenses</p>
            </CardContent>
          </Card>

          <Card className="card-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center">
                  <Wallet className="text-white" size={24} />
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Saved
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-1">$5,175</h3>
              <p className="text-muted-foreground text-sm">Net Savings</p>
            </CardContent>
          </Card>

          <Card className="card-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-secondary to-secondary-light rounded-full flex items-center justify-center">
                  <Target className="text-white" size={24} />
                </div>
                <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                  On Track
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-secondary mb-1">$45,230</h3>
              <p className="text-muted-foreground text-sm">Total Net Worth</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Budget Tracking */}
          <div className="lg:col-span-2">
            <Card className="card-elegant">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-display">Budget Overview</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Calendar size={16} />
                    This Month
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {budgetCategories.map((category) => {
                    const percentage = (category.spent / category.budget) * 100;
                    const isOverBudget = percentage > 100;
                    
                    return (
                      <div key={category.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <span className={`font-semibold ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
                              ${category.spent}
                            </span>
                            <span className="text-muted-foreground text-sm"> / ${category.budget}</span>
                          </div>
                        </div>
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className={`h-2 ${isOverBudget ? 'bg-destructive/20' : ''}`}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{percentage.toFixed(1)}% used</span>
                          <span className={isOverBudget ? 'text-destructive font-medium' : ''}>
                            ${category.budget - category.spent} remaining
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <div>
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="text-xl font-display">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.amount > 0 
                            ? 'bg-success/10' 
                            : 'bg-muted'
                        }`}>
                          {transaction.amount > 0 ? (
                            <TrendingUp className="text-success" size={16} />
                          ) : (
                            <CreditCard className="text-muted-foreground" size={16} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.amount > 0 ? 'text-success' : 'text-foreground'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {transaction.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4">
                  View All Transactions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Budget Management */}
        <div className="mt-8">
          <BudgetManager />
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;