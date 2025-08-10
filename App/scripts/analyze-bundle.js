#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * 
 * This script analyzes the bundle size and provides insights into the
 * PrimeVue migration impact on bundle size and performance.
 */

const fs = require('fs')
const path = require('path')

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function analyzeDistFolder() {
  const distPath = path.join(__dirname, '../dist')
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ Dist folder not found. Run "npm run build" first.')
    return
  }

  console.log('📊 Bundle Analysis Report')
  console.log('=' .repeat(50))

  const assets = fs.readdirSync(path.join(distPath, 'assets'))
  let totalSize = 0
  const fileAnalysis = []

  assets.forEach(file => {
    const filePath = path.join(distPath, 'assets', file)
    const stats = fs.statSync(filePath)
    totalSize += stats.size
    
    fileAnalysis.push({
      name: file,
      size: stats.size,
      type: path.extname(file)
    })
  })

  // Sort by size (largest first)
  fileAnalysis.sort((a, b) => b.size - a.size)

  console.log(`\n📦 Total Bundle Size: ${formatBytes(totalSize)}`)
  console.log('\n📋 File Breakdown:')
  
  fileAnalysis.forEach((file, index) => {
    const percentage = ((file.size / totalSize) * 100).toFixed(1)
    console.log(`${index + 1}. ${file.name}`)
    console.log(`   Size: ${formatBytes(file.size)} (${percentage}%)`)
    console.log(`   Type: ${file.type}`)
    console.log('')
  })

  // Analyze by file type
  const typeAnalysis = {}
  fileAnalysis.forEach(file => {
    if (!typeAnalysis[file.type]) {
      typeAnalysis[file.type] = { count: 0, size: 0 }
    }
    typeAnalysis[file.type].count++
    typeAnalysis[file.type].size += file.size
  })

  console.log('📊 Analysis by File Type:')
  Object.entries(typeAnalysis).forEach(([type, data]) => {
    const percentage = ((data.size / totalSize) * 100).toFixed(1)
    console.log(`${type}: ${data.count} files, ${formatBytes(data.size)} (${percentage}%)`)
  })

  // Performance recommendations
  console.log('\n💡 Performance Recommendations:')
  
  if (totalSize > 2 * 1024 * 1024) { // 2MB
    console.log('⚠️  Bundle size is large (>2MB). Consider:')
    console.log('   - Code splitting for routes')
    console.log('   - Lazy loading of heavy components')
    console.log('   - Tree shaking optimization')
  }

  const jsFiles = fileAnalysis.filter(f => f.type === '.js')
  const largeJsFiles = jsFiles.filter(f => f.size > 500 * 1024) // 500KB
  
  if (largeJsFiles.length > 0) {
    console.log('⚠️  Large JavaScript files detected:')
    largeJsFiles.forEach(file => {
      console.log(`   - ${file.name}: ${formatBytes(file.size)}`)
    })
    console.log('   Consider splitting these into smaller chunks')
  }

  // PrimeVue specific analysis
  const primeVueFiles = fileAnalysis.filter(f => 
    f.name.includes('primevue') || f.name.includes('prime')
  )
  
  if (primeVueFiles.length > 0) {
    const primeVueSize = primeVueFiles.reduce((sum, f) => sum + f.size, 0)
    const primeVuePercentage = ((primeVueSize / totalSize) * 100).toFixed(1)
    
    console.log(`\n🎨 PrimeVue Impact:`)
    console.log(`   Files: ${primeVueFiles.length}`)
    console.log(`   Size: ${formatBytes(primeVueSize)} (${primeVuePercentage}% of total)`)
    
    if (primeVuePercentage > 30) {
      console.log('   💡 Consider optimizing PrimeVue imports for better tree shaking')
    } else {
      console.log('   ✅ PrimeVue bundle size is reasonable')
    }
  }

  console.log('\n✅ Analysis complete!')
}

// Run analysis
analyzeDistFolder()