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
//  A load-time constructor only subscribes to the launch notification; all
//  HealthKit and UserDefaults work runs inside the launch sequence, where
//  Apple documents observer setup to belong. In app extensions the
//  notification never fires, so this is inert there.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

// Implemented in NitroHealthBackgroundBootstrap.swift via @_cdecl.
extern void NitroHealthPrivateRegisterPersistedObservers(void);

static id NitroHealthLaunchObserverToken = nil;

__attribute__((constructor)) static void NitroHealthInstallBackgroundBootstrap(void) {
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
