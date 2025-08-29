// CloudFlare Worker to proxy requests to S3 bucket
// This fixes the Host header issue when accessing staging.tacodelitewestplano.com

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    try {
        const url = new URL(request.url)

        // Check if this is an API call (starts with /prod/)
        if (url.pathname.startsWith('/prod/')) {
            // This is an API call - proxy to API Gateway
            const baseUrl = 'https://j0uotuymd1.execute-api.us-east-1.amazonaws.com'

            // Map React app calls to correct API Gateway paths
            let apiPath = url.pathname.replace('/prod', '')
            if (apiPath === '/getCategories') apiPath = '/categories'
            if (apiPath === '/getMenuItems') apiPath = '/menu-items'
            if (apiPath === '/searchMenuItems') apiPath = '/search'
            if (apiPath === '/getMenuItemsByCategory') apiPath = '/menu-items-by-category'

            const apiUrl = new URL('/prod' + apiPath + url.search, baseUrl)

            console.log(`Proxying API call: ${url.pathname} -> ${apiUrl.toString()}`)

            // Clone headers for API Gateway but be selective
            const headers = new Headers()
            headers.set('Host', new URL(baseUrl).host)
            headers.set('Content-Type', 'application/json')
            headers.set('Origin', 'https://staging.tacodelitewestplano.com')
            headers.set('Referer', 'https://staging.tacodelitewestplano.com')

            // Only forward essential headers, avoid CloudFlare-specific ones
            if (request.headers.get('Accept')) headers.set('Accept', request.headers.get('Accept'))
            if (request.headers.get('User-Agent')) headers.set('User-Agent', request.headers.get('User-Agent'))

            // Forward the request to API Gateway
            try {
                const apiResponse = await fetch(apiUrl.toString(), {
                    method: request.method,
                    headers: headers,
                    body: request.body
                })

                console.log(`API response status: ${apiResponse.status}`)
                return apiResponse
            } catch (error) {
                console.error(`API Gateway error: ${error.message}`)
                return new Response(`API Gateway Error: ${error.message}`, {
                    status: 500,
                    headers: { 'Content-Type': 'text/plain' }
                })
            }
        }

        // This is a static file request - proxy to S3
        const s3Endpoint = 'http://tacodelite-app-staging.s3-website-us-east-1.amazonaws.com'

        // Clone headers and set correct Host
        const headers = new Headers(request.headers)
        headers.set('Host', 'tacodelite-app-staging.s3-website-us-east-1.amazonaws.com')

        // Try the original path first
        let s3Url = new URL(url.pathname + url.search, s3Endpoint)
        let s3Request = new Request(s3Url.toString(), {
            method: request.method,
            headers: headers,
            body: request.body
        })

        let response = await fetch(s3Request)

        // If S3 returns 404 (NoSuchKey), try serving index.html for SPA routing
        if (response.status === 404 && !url.pathname.includes('.')) {
            console.log(`Path ${url.pathname} not found, serving index.html for SPA routing`)

            // Try to serve index.html instead
            s3Url = new URL('/index.html' + url.search, s3Endpoint)
            s3Request = new Request(s3Url.toString(), {
                method: request.method,
                headers: headers,
                body: request.body
            })

            response = await fetch(s3Request)

            // If index.html exists, modify the response to indicate it's for the original path
            if (response.status === 200) {
                const modifiedResponse = new Response(response.body, {
                    status: 200,
                    headers: response.headers
                })
                modifiedResponse.headers.set('Content-Type', 'text/html')
                return modifiedResponse
            }
        }

        return response

    } catch (error) {
        console.error('Worker error:', error)
        return new Response(`Worker Error: ${error.message}`, {
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
        })
    }
}
