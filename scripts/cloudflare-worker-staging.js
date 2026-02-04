// CloudFlare Worker to proxy requests to S3 bucket
// This fixes the Host header issue when accessing staging.tacodelitewestplano.com

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    try {
        const url = new URL(request.url);

        // Check if this is an API call (starts with /prod/)
        if (url.pathname.startsWith('/prod/')) {
            // Handle admin authentication routes first
            if (url.pathname.startsWith('/prod/admin/')) {
                // This is an admin API call - proxy to API Gateway
                const baseUrl =
                    'https://i8vgeh8do9.execute-api.us-east-1.amazonaws.com';

                // Map admin calls to correct API Gateway paths
                // Remove /prod prefix and keep the admin path
                let apiPath = url.pathname.replace('/prod', '');

                const apiUrl = new URL('/prod' + apiPath + url.search, baseUrl);

                console.log(
                    `Proxying admin API call: ${url.pathname} -> ${apiUrl.toString()}`
                );

                // Clone headers for API Gateway but be selective
                const headers = new Headers();
                headers.set('Host', new URL(baseUrl).host);
                headers.set('Content-Type', 'application/json');

                // Use the request's origin or default to staging
                const requestOrigin =
                    request.headers.get('Origin') ||
                    'https://staging.tacodelitewestplano.com';
                headers.set('Origin', requestOrigin);
                headers.set('Referer', requestOrigin);

                // Forward Authorization header for admin routes
                if (request.headers.get('Authorization')) {
                    headers.set(
                        'Authorization',
                        request.headers.get('Authorization')
                    );
                }

                // Only forward essential headers, avoid CloudFlare-specific ones
                if (request.headers.get('Accept'))
                    headers.set('Accept', request.headers.get('Accept'));
                if (request.headers.get('User-Agent'))
                    headers.set(
                        'User-Agent',
                        request.headers.get('User-Agent')
                    );

                // Forward the request to API Gateway
                try {
                    const apiResponse = await fetch(apiUrl.toString(), {
                        method: request.method,
                        headers: headers,
                        body: request.body,
                    });

                    console.log(
                        `Admin API response status: ${apiResponse.status}`
                    );

                    // Create a new response with proper CORS headers
                    const responseHeaders = new Headers(apiResponse.headers);

                    // Add CORS headers for admin API calls
                    responseHeaders.set(
                        'Access-Control-Allow-Origin',
                        requestOrigin
                    );
                    responseHeaders.set(
                        'Access-Control-Allow-Headers',
                        'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
                    );
                    responseHeaders.set(
                        'Access-Control-Allow-Methods',
                        'GET, POST, OPTIONS'
                    );

                    // Force no-cache headers to prevent CloudFlare caching
                    responseHeaders.set(
                        'Cache-Control',
                        'no-cache, no-store, must-revalidate'
                    );
                    responseHeaders.set('Pragma', 'no-cache');
                    responseHeaders.set('Expires', '0');

                    return new Response(apiResponse.body, {
                        status: apiResponse.status,
                        statusText: apiResponse.statusText,
                        headers: responseHeaders,
                    });
                } catch (error) {
                    console.error(`Admin API Gateway error: ${error.message}`);
                    return new Response(
                        `Admin API Gateway Error: ${error.message}`,
                        {
                            status: 500,
                            headers: { 'Content-Type': 'text/plain' },
                        }
                    );
                }
            }

            // Handle other API calls - proxy to API Gateway
            const baseUrl =
                'https://i8vgeh8do9.execute-api.us-east-1.amazonaws.com';

            // Map API calls to correct API Gateway paths
            // API Gateway uses /menu/* structure; admin and legacy app use flat paths
            let apiPath = url.pathname.replace('/prod', '');
            const searchParams = new URLSearchParams(url.search);

            if (apiPath === '/getCategories') apiPath = '/categories';
            if (apiPath === '/getMenuItems' || apiPath === '/menu-items')
                apiPath = '/menu/menu-items';
            // Map /menu-items/{id} for PUT, DELETE, GET (edit page)
            if (apiPath.match(/^\/menu-items\/([^/]+)$/)) {
                const match = apiPath.match(/^\/menu-items\/([^/]+)$/);
                apiPath = `/menu/menu-items/${match[1]}`;
            }
            if (apiPath === '/searchMenuItems') apiPath = '/search';
            if (
                apiPath === '/getMenuItemsByCategory' ||
                apiPath === '/menu-items-by-category'
            ) {
                const categoryId = searchParams.get('categoryId');
                apiPath = categoryId
                    ? `/menu/menu-items/items/by-category/${categoryId}`
                    : '/menu/menu-items';
                searchParams.delete('categoryId');
            }
            if (apiPath === '/search-menu-items') {
                apiPath = '/menu/menu-items/items/search';
                // query param stays in searchParams
            }

            const queryString = searchParams.toString();
            const apiUrl = new URL(
                '/prod' + apiPath + (queryString ? '?' + queryString : ''),
                baseUrl
            );

            console.log(
                `Proxying API call: ${url.pathname} -> ${apiUrl.toString()}`
            );

            // Clone headers for API Gateway but be selective
            const headers = new Headers();
            headers.set('Host', new URL(baseUrl).host);
            headers.set('Content-Type', 'application/json');

            // Use the request's origin or default to staging
            const requestOrigin =
                request.headers.get('Origin') ||
                'https://staging.tacodelitewestplano.com';
            headers.set('Origin', requestOrigin);
            headers.set('Referer', requestOrigin);

            // Only forward essential headers, avoid CloudFlare-specific ones
            if (request.headers.get('Accept'))
                headers.set('Accept', request.headers.get('Accept'));
            if (request.headers.get('User-Agent'))
                headers.set('User-Agent', request.headers.get('User-Agent'));

            // Forward the request to API Gateway
            try {
                const apiResponse = await fetch(apiUrl.toString(), {
                    method: request.method,
                    headers: headers,
                    body: request.body,
                });

                console.log(`API response status: ${apiResponse.status}`);

                // Create a new response with no-cache headers to prevent CloudFlare caching
                const responseHeaders = new Headers(apiResponse.headers);
                responseHeaders.set(
                    'Cache-Control',
                    'no-cache, no-store, must-revalidate'
                );
                responseHeaders.set('Pragma', 'no-cache');
                responseHeaders.set('Expires', '0');

                return new Response(apiResponse.body, {
                    status: apiResponse.status,
                    statusText: apiResponse.statusText,
                    headers: responseHeaders,
                });
            } catch (error) {
                console.error(`API Gateway error: ${error.message}`);
                return new Response(`API Gateway Error: ${error.message}`, {
                    status: 500,
                    headers: { 'Content-Type': 'text/plain' },
                });
            }
        }

        // This is a static file request - proxy to S3
        const s3Endpoint =
            'http://tacodelite-app-staging.s3-website-us-east-1.amazonaws.com';

        // Clone headers and set correct Host
        const headers = new Headers(request.headers);
        headers.set(
            'Host',
            'tacodelite-app-staging.s3-website-us-east-1.amazonaws.com'
        );

        // Handle admin app routing
        let s3Path = url.pathname;
        let isAdminRequest = false;

        // Check if this is an admin request
        if (url.pathname.startsWith('/admin/')) {
            isAdminRequest = true;
            // Keep the /admin/ prefix for S3 routing
            s3Path = url.pathname;
        }

        // Try the original path first
        let s3Url = new URL(s3Path + url.search, s3Endpoint);
        let s3Request = new Request(s3Url.toString(), {
            method: request.method,
            headers: headers,
            body: request.body,
        });

        let response = await fetch(s3Request);

        // If S3 returns 404 (NoSuchKey), try serving index.html for SPA routing
        if (response.status === 404 && !url.pathname.includes('.')) {
            console.log(
                `Path ${url.pathname} not found, serving index.html for SPA routing`
            );

            // For admin requests, serve admin/index.html
            // For main app requests, serve index.html
            let fallbackPath = isAdminRequest
                ? '/admin/index.html'
                : '/index.html';

            s3Url = new URL(fallbackPath + url.search, s3Endpoint);
            s3Request = new Request(s3Url.toString(), {
                method: request.method,
                headers: headers,
                body: request.body,
            });

            response = await fetch(s3Request);

            // If index.html exists, modify the response to indicate it's for the original path
            if (response.status === 200) {
                const modifiedResponse = new Response(response.body, {
                    status: 200,
                    headers: response.headers,
                });
                modifiedResponse.headers.set('Content-Type', 'text/html');
                return modifiedResponse;
            }
        }

        return response;
    } catch (error) {
        console.error('Worker error:', error);
        return new Response(`Worker Error: ${error.message}`, {
            status: 500,
            headers: { 'Content-Type': 'text/plain' },
        });
    }
}
