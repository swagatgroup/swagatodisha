# Swagat Odisha Backend Server Test Script
# PowerShell version for Windows

$BaseUrl = "http://localhost:5000"
$ApiUrl = "$BaseUrl/api"

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json -Depth 10
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Content = $response.Content
        }
    }
    catch {
        return @{
            Success = $false
            StatusCode = $_.Exception.Response.StatusCode.value__
            Error = $_.Exception.Message
        }
    }
}

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Details = ""
    )
    
    if ($Success) {
        Write-ColorOutput Green "✅ $TestName"
        if ($Details) { Write-ColorOutput Yellow "   $Details" }
    } else {
        Write-ColorOutput Red "❌ $TestName"
        if ($Details) { Write-ColorOutput Yellow "   $Details" }
    }
}

# Test counters
$PassedTests = 0
$FailedTests = 0
$TotalTests = 0

Write-ColorOutput Cyan "🚀 Starting Server Tests..."
Write-ColorOutput Blue "📡 Testing server at: $BaseUrl"
Write-ColorOutput Cyan "=" * 50

# Test 1: Server Health
Write-ColorOutput Cyan "`n🔍 Testing Server Health..."
$TotalTests++
$result = Test-Endpoint -Method "GET" -Url "$BaseUrl/health"
if ($result.Success -and $result.StatusCode -eq 200) {
    Write-TestResult -TestName "Server Health Check" -Success $true -Details "Server is running and responding"
    $PassedTests++
} else {
    Write-TestResult -TestName "Server Health Check" -Success $false -Details "Status: $($result.StatusCode), Error: $($result.Error)"
    $FailedTests++
}

# Test 2: Root Endpoint
Write-ColorOutput Cyan "`n🔍 Testing Root Endpoint..."
$TotalTests++
$result = Test-Endpoint -Method "GET" -Url "$BaseUrl/"
if ($result.Success -and $result.StatusCode -eq 200) {
    Write-TestResult -TestName "Root Endpoint" -Success $true -Details "Root endpoint accessible"
    $PassedTests++
} else {
    Write-TestResult -TestName "Root Endpoint" -Success $false -Details "Status: $($result.StatusCode), Error: $($result.Error)"
    $FailedTests++
}

# Test 3: API Health
Write-ColorOutput Cyan "`n🔍 Testing API Health..."
$TotalTests++
$result = Test-Endpoint -Method "GET" -Url "$ApiUrl/health"
if ($result.Success -and $result.StatusCode -eq 200) {
    Write-TestResult -TestName "API Health Check" -Success $true -Details "API health endpoint working"
    $PassedTests++
} else {
    Write-TestResult -TestName "API Health Check" -Success $false -Details "Status: $($result.StatusCode), Error: $($result.Error)"
    $FailedTests++
}

# Test 4: User Registration
Write-ColorOutput Cyan "`n🔍 Testing User Registration..."
$TotalTests++
$testUser = @{
    fullName = "PowerShell Test User"
    email = "powershelltest@example.com"
    password = "testpassword123"
    phoneNumber = "9876543212"
    role = "student"
}
$result = Test-Endpoint -Method "POST" -Url "$ApiUrl/auth/register" -Body $testUser
if ($result.Success -and $result.StatusCode -eq 201) {
    Write-TestResult -TestName "User Registration" -Success $true -Details "User registered successfully"
    $PassedTests++
} else {
    Write-TestResult -TestName "User Registration" -Success $false -Details "Status: $($result.StatusCode), Error: $($result.Error)"
    $FailedTests++
}

# Test 5: User Login
Write-ColorOutput Cyan "`n🔍 Testing User Login..."
$TotalTests++
$loginData = @{
    email = "powershelltest@example.com"
    password = "testpassword123"
}
$result = Test-Endpoint -Method "POST" -Url "$ApiUrl/auth/login" -Body $loginData
if ($result.Success -and $result.StatusCode -eq 200) {
    Write-TestResult -TestName "User Login" -Success $true -Details "Login successful"
    $PassedTests++
} else {
    Write-TestResult -TestName "User Login" -Success $false -Details "Status: $($result.StatusCode), Error: $($result.Error)"
    $FailedTests++
}

# Test 6: Create Test Application
Write-ColorOutput Cyan "`n🔍 Testing Create Test Application..."
$TotalTests++
$result = Test-Endpoint -Method "POST" -Url "$ApiUrl/student-application/create-test"
if ($result.Success -and $result.StatusCode -eq 200) {
    Write-TestResult -TestName "Create Test Application" -Success $true -Details "Test application created"
    $PassedTests++
} else {
    Write-TestResult -TestName "Create Test Application" -Success $false -Details "Status: $($result.StatusCode), Error: $($result.Error)"
    $FailedTests++
}

# Test 7: Get Applications Count
Write-ColorOutput Cyan "`n🔍 Testing Applications Count..."
$TotalTests++
$result = Test-Endpoint -Method "GET" -Url "$ApiUrl/debug/applications-count"
if ($result.Success -and $result.StatusCode -eq 200) {
    $data = $result.Content | ConvertFrom-Json
    $count = $data.data.totalApplications
    Write-TestResult -TestName "Applications Count" -Success $true -Details "Total applications: $count"
    $PassedTests++
} else {
    Write-TestResult -TestName "Applications Count" -Success $false -Details "Status: $($result.StatusCode), Error: $($result.Error)"
    $FailedTests++
}

# Test 8: Performance Metrics
Write-ColorOutput Cyan "`n🔍 Testing Performance Metrics..."
$TotalTests++
$result = Test-Endpoint -Method "GET" -Url "$ApiUrl/performance/metrics"
if ($result.Success -and $result.StatusCode -eq 200) {
    Write-TestResult -TestName "Performance Metrics" -Success $true -Details "Performance metrics accessible"
    $PassedTests++
} else {
    Write-TestResult -TestName "Performance Metrics" -Success $false -Details "Status: $($result.StatusCode), Error: $($result.Error)"
    $FailedTests++
}

# Print Summary
Write-ColorOutput Cyan "`n" + ("=" * 50)
Write-ColorOutput White "📊 Test Summary:"
Write-ColorOutput Green "✅ Passed: $PassedTests"
Write-ColorOutput Red "❌ Failed: $FailedTests"
Write-ColorOutput Blue "📈 Total: $TotalTests"

$SuccessRate = [math]::Round(($PassedTests / $TotalTests) * 100, 1)
if ($SuccessRate -ge 80) {
    Write-ColorOutput Green "🎯 Success Rate: $SuccessRate%"
} else {
    Write-ColorOutput Yellow "🎯 Success Rate: $SuccessRate%"
}

Write-ColorOutput White "`n🏁 Testing Complete!"

# Exit with appropriate code
if ($FailedTests -gt 0) {
    exit 1
} else {
    exit 0
}


