//
//  NitroHealthBackgroundBootstrap.m
//  NitroHealth
//
//  Restores persisted HealthKit observers automatically at app launch, so
//  terminated-app background delivery works without any consumer AppDelegate
//  code. HKObserverQuery instances die with the process; the system-side
//  enableBackgroundDelivery registration survives and relaunches the app,
//  which must have observers standing again by the end of the launch
//  sequence or HealthKit throttles future deliveries.
//
//  The hook must live in an Objective-C class +load, not a C-level
//  __attribute__((constructor)): the pod links as a static archive, and the
//  linker only extracts an archive member nothing references when -ObjC
//  forces it to — which it does solely for members that define an
//  Objective-C class or category. A bare constructor in a class-less file
//  is silently dropped and never runs.
//
//  +load only subscribes to the launch notification; all HealthKit and
//  UserDefaults work runs inside the launch sequence, where Apple documents
//  observer setup to belong. In app extensions the notification never
//  fires, so this is inert there.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

// Implemented in NitroHealthBackgroundBootstrap.swift via @_cdecl.
extern void NitroHealthPrivateRegisterPersistedObservers(void);

static id NitroHealthLaunchObserverToken = nil;

@interface NitroHealthBackgroundBootstrap : NSObject
@end

@implementation NitroHealthBackgroundBootstrap

+ (void)load {
  NitroHealthLaunchObserverToken = [[NSNotificationCenter defaultCenter]
      addObserverForName:UIApplicationDidFinishLaunchingNotification
                  object:nil
                   queue:[NSOperationQueue mainQueue]
              usingBlock:^(NSNotification *_Nonnull notification) {
                NitroHealthPrivateRegisterPersistedObservers();
                if (NitroHealthLaunchObserverToken != nil) {
                  [[NSNotificationCenter defaultCenter] removeObserver:NitroHealthLaunchObserverToken];
                  NitroHealthLaunchObserverToken = nil;
                }
              }];
}

@end
