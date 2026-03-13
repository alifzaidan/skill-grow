<?php

namespace App\Http\Controllers;

use App\Models\Bootcamp;
use App\Models\Bundle;
use App\Models\Course;
use App\Models\Invoice;
use App\Models\Webinar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        try {
            $query = $request->get('q', '');

            if (empty(trim($query))) {
                return response()->json([]);
            }

            $results = collect();

            $myCourseIds = [];
            $myBootcampIds = [];
            $myWebinarIds = [];
            $myBundleIds = [];

            if (Auth::check()) {
                $userId = Auth::id();
                $paidInvoices = Invoice::with(['courseItems', 'bootcampItems', 'webinarItems', 'bundleEnrollments'])
                    ->where('user_id', $userId)
                    ->where('status', 'paid')
                    ->get();
                Log::info("Paid Invoices: " . $paidInvoices->count());

                $myCourseIds = $paidInvoices->flatMap(function ($invoice) {
                    return $invoice->courseItems->pluck('course_id');
                })->unique()->values()->all();

                $myBootcampIds = $paidInvoices->flatMap(function ($invoice) {
                    return $invoice->bootcampItems->pluck('bootcamp_id');
                })->unique()->values()->all();

                $myWebinarIds = $paidInvoices->flatMap(function ($invoice) {
                    return $invoice->webinarItems->pluck('webinar_id');
                })->unique()->values()->all();

                $myBundleIds = $paidInvoices->flatMap(function ($invoice) {
                    return $invoice->bundleEnrollments->pluck('bundle_id');
                })->unique()->values()->all();
            }

            $courses = Course::with(['category', 'user'])
                ->where('status', 'published')
                ->where(function ($q) use ($query) {
                    $q->where('title', 'LIKE', "%{$query}%")
                        ->orWhere('description', 'LIKE', "%{$query}%")
                        ->orWhere('short_description', 'LIKE', "%{$query}%")
                        ->orWhereHas('user', function ($userQuery) use ($query) {
                            $userQuery->where('name', 'LIKE', "%{$query}%");
                        });
                })
                ->take(5)
                ->get()
                ->map(function ($course) use ($myCourseIds) {
                    $hasAccess = in_array($course->id, $myCourseIds);
                    return [
                        'id' => $course->id,
                        'title' => $course->title,
                        'type' => 'course',
                        'href' => $hasAccess ? "/profile/my-courses" : "/course/{$course->slug}",
                        'description' => $course->short_description ?? $course->description,
                        'price' => $this->formatPrice($course->price),
                        'strikethrough_price' => $this->formatPrice($course->strikethrough_price),
                        'instructor' => $course->user->name ?? null,
                        'thumbnail' => $course->thumbnail,
                        'level' => $course->level,
                        'category' => $course->category->name ?? null,
                        'has_access' => $hasAccess,
                    ];
                });

            $bootcamps = Bootcamp::with(['category', 'mentors'])
                ->where('status', 'published')
                ->where(function ($q) use ($myBootcampIds) {
                    $q->where(function ($subQ) {
                        $subQ->where('start_date', '>=', now()->toDateString())
                            ->where('registration_deadline', '>=', now());
                    })->orWhereIn('id', $myBootcampIds);
                })
                ->where(function ($q) use ($query) {
                    $q->where('title', 'LIKE', "%{$query}%")
                        ->orWhere('description', 'LIKE', "%{$query}%")
                        ->orWhereHas('mentors', function ($userQuery) use ($query) {
                            $userQuery->where('name', 'LIKE', "%{$query}%");
                        });
                })
                ->take(5)
                ->get()
                ->map(function ($bootcamp) use ($myBootcampIds) {
                    $hasAccess = in_array($bootcamp->id, $myBootcampIds);
                    $duration = $this->calculateDuration($bootcamp->start_date, $bootcamp->end_date);
                    return [
                        'id' => $bootcamp->id,
                        'title' => $bootcamp->title,
                        'type' => 'bootcamp',
                        'href' => $hasAccess ? "/profile/my-bootcamps" : "/bootcamp/{$bootcamp->slug}",
                        'description' => $bootcamp->description,
                        'price' => $this->formatPrice($bootcamp->price),
                        'strikethrough_price' => $this->formatPrice($bootcamp->strikethrough_price),
                        'instructor' => $bootcamp->mentors->pluck('name')->first() ?? null,
                        'thumbnail' => $bootcamp->thumbnail,
                        'duration' => $duration,
                        'start_date' => $bootcamp->start_date,
                        'registration_deadline' => $bootcamp->registration_deadline,
                        'category' => $bootcamp->category->name ?? null,
                        'quota' => $bootcamp->quota,
                        'has_access' => $hasAccess,
                    ];
                });

            $webinars = Webinar::with(['category', 'user'])
                ->where('status', 'published')
                ->where(function ($q) use ($myWebinarIds) {
                    $q->where(function ($subQ) {
                        $subQ->where('start_time', '>=', now())
                            ->where('registration_deadline', '>=', now());
                    })->orWhereIn('id', $myWebinarIds);
                })
                ->where(function ($q) use ($query) {
                    $q->where('title', 'LIKE', "%{$query}%")
                        ->orWhere('description', 'LIKE', "%{$query}%")
                        ->orWhereHas('user', function ($userQuery) use ($query) {
                            $userQuery->where('name', 'LIKE', "%{$query}%");
                        });
                })
                ->take(5)
                ->get()
                ->map(function ($webinar) use ($myWebinarIds) {
                    $hasAccess = in_array($webinar->id, $myWebinarIds);
                    $duration = $this->calculateWebinarDuration($webinar->start_time, $webinar->end_time);
                    return [
                        'id' => $webinar->id,
                        'title' => $webinar->title,
                        'type' => 'webinar',
                        'href' => $hasAccess ? "/profile/my-webinars" : "/webinar/{$webinar->slug}",
                        'description' => $webinar->description,
                        'price' => $this->formatPrice($webinar->price),
                        'strikethrough_price' => $this->formatPrice($webinar->strikethrough_price),
                        'instructor' => $webinar->user->name ?? null,
                        'thumbnail' => $webinar->thumbnail,
                        'duration' => $duration,
                        'start_time' => $webinar->start_time,
                        'registration_deadline' => $webinar->registration_deadline,
                        'category' => $webinar->category->name ?? null,
                        'quota' => $webinar->quota,
                        'has_access' => $hasAccess,
                    ];
                });

            $bundles = Bundle::with(['user'])
                ->where('status', 'published')
                ->where(function ($q) use ($myBundleIds) {
                    $q->whereNull('registration_deadline')
                        ->orWhere('registration_deadline', '>=', now())
                        ->orWhereIn('id', $myBundleIds);
                })
                ->where(function ($q) use ($query) {
                    $q->where('title', 'LIKE', "%{$query}%")
                        ->orWhere('description', 'LIKE', "%{$query}%")
                        ->orWhereHas('user', function ($userQuery) use ($query) {
                            $userQuery->where('name', 'LIKE', "%{$query}%");
                        });
                })
                ->take(5)
                ->get()
                ->map(function ($bundle) use ($myBundleIds) {
                    $hasAccess = in_array($bundle->id, $myBundleIds);
                    return [
                        'id' => $bundle->id,
                        'title' => $bundle->title,
                        'type' => 'bundle',
                        'href' => $hasAccess ? '/profile/my-bundles' : "/bundle/{$bundle->slug}",
                        'description' => $bundle->description,
                        'price' => $this->formatPrice($bundle->price),
                        'strikethrough_price' => $this->formatPrice($bundle->strikethrough_price),
                        'instructor' => $bundle->user->name ?? null,
                        'thumbnail' => $bundle->thumbnail,
                        'registration_deadline' => $bundle->registration_deadline,
                        'has_access' => $hasAccess,
                    ];
                });

            $results = $results->merge($courses)->merge($bootcamps)->merge($webinars)->merge($bundles);

            return response()->json($results->values());
        } catch (\Exception $e) {
            Log::error('Search failed', [
                'query' => $request->get('q', ''),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json(['error' => 'Search failed'], 500);
        }
    }

    private function formatPrice($price)
    {
        if ($price == 0 || $price === null) {
            return 'Gratis';
        }
        return 'Rp ' . number_format($price, 0, ',', '.');
    }

    private function calculateDuration($startDate, $endDate)
    {
        if (!$endDate) {
            return null;
        }

        $start = \Carbon\Carbon::parse($startDate);
        $end = \Carbon\Carbon::parse($endDate);
        $diffInDays = $start->diffInDays($end);

        if ($diffInDays < 7) {
            return $diffInDays . ' hari';
        } elseif ($diffInDays < 30) {
            $weeks = ceil($diffInDays / 7);
            return $weeks . ' minggu';
        } else {
            $months = ceil($diffInDays / 30);
            return $months . ' bulan';
        }
    }

    private function calculateWebinarDuration($startTime, $endTime)
    {
        if (!$endTime) {
            return '2 jam';
        }

        $start = \Carbon\Carbon::parse($startTime);
        $end = \Carbon\Carbon::parse($endTime);
        $diffInHours = $start->diffInHours($end);

        if ($diffInHours < 1) {
            $minutes = $start->diffInMinutes($end);
            return $minutes . ' menit';
        } else {
            return $diffInHours . ' jam';
        }
    }
}
